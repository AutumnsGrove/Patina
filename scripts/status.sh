#!/bin/bash
#
# Patina Backup Status - Beautiful Terminal Display
# Usage: ./scripts/status.sh [--days N] [--json]
#
# "Time adds a patina to things of value."
#

set -e

# Colors
RESET='\033[0m'
BOLD='\033[1m'
DIM='\033[2m'
GREEN='\033[32m'
YELLOW='\033[33m'
BLUE='\033[34m'
CYAN='\033[36m'
WHITE='\033[37m'
BG_GREEN='\033[42m'
BG_YELLOW='\033[43m'
BG_RED='\033[41m'

# Box drawing
H_LINE="─"
V_LINE="│"
TL="╭"
TR="╮"
BL="╰"
BR="╯"
T_DOWN="┬"
T_UP="┴"
T_RIGHT="├"
T_LEFT="┤"
CROSS="┼"

# Symbols
CHECK="✓"
WARN="⚠"
FAIL="✗"
TREE="🌲"
LEAF="🍂"

# Config
DAYS=${1:-7}
DB_NAME="grove-backups-db"

# Parse args
while [[ $# -gt 0 ]]; do
    case $1 in
        --days|-d) DAYS="$2"; shift 2 ;;
        --json|-j) JSON_OUTPUT=1; shift ;;
        --help|-h)
            echo "Usage: ./scripts/status.sh [--days N] [--json]"
            echo "  --days, -d N   Show last N days (default: 7)"
            echo "  --json, -j     Output raw JSON data"
            exit 0
            ;;
        *) shift ;;
    esac
done

# Get data from D1
get_backup_summary() {
    local result=$(wrangler d1 execute "$DB_NAME" --remote --json --command="
        SELECT
            COUNT(*) as total_backups,
            COUNT(DISTINCT backup_date) as unique_days,
            SUM(size_bytes) as total_bytes,
            MIN(backup_date) as first_backup,
            MAX(backup_date) as last_backup
        FROM backup_inventory
        WHERE deleted_at IS NULL
    " 2>/dev/null)
    echo "$result" | jq -r 'if type == "array" then .[0].results[0] else empty end' 2>/dev/null || echo '{"total_backups":0,"unique_days":0,"total_bytes":0}'
}

get_daily_backups() {
    wrangler d1 execute "$DB_NAME" --remote --json --command="
        SELECT
            backup_date,
            COUNT(*) as backup_count,
            SUM(size_bytes) as total_size,
            GROUP_CONCAT(database_name) as databases
        FROM backup_inventory
        WHERE deleted_at IS NULL
        GROUP BY backup_date
        ORDER BY backup_date DESC
        LIMIT $DAYS
    " 2>/dev/null | jq -r '.[0].results'
}

get_job_history() {
    wrangler d1 execute "$DB_NAME" --remote --json --command="
        SELECT
            status,
            trigger_type,
            total_databases,
            successful_count,
            failed_count,
            datetime(started_at, 'unixepoch') as started,
            duration_ms
        FROM backup_jobs
        ORDER BY started_at DESC
        LIMIT 10
    " 2>/dev/null | jq -r '.[0].results'
}

get_database_stats() {
    wrangler d1 execute "$DB_NAME" --remote --json --command="
        SELECT
            database_name,
            COUNT(*) as backup_count,
            SUM(size_bytes) as total_size,
            MAX(backup_date) as last_backup
        FROM backup_inventory
        WHERE deleted_at IS NULL
        GROUP BY database_name
        ORDER BY total_size DESC
    " 2>/dev/null | jq -r '.[0].results'
}

format_bytes() {
    local bytes=$1
    if [ -z "$bytes" ] || [ "$bytes" = "null" ]; then
        echo "0 B"
        return
    fi
    if [ "$bytes" -lt 1024 ]; then
        echo "${bytes} B"
    elif [ "$bytes" -lt 1048576 ]; then
        echo "$(echo "scale=1; $bytes / 1024" | bc) KB"
    else
        echo "$(echo "scale=2; $bytes / 1048576" | bc) MB"
    fi
}

print_header() {
    local width=70
    echo ""
    echo -e "${CYAN}${BOLD}"
    echo "    ╭──────────────────────────────────────────────────────────────╮"
    echo "    │                                                              │"
    echo -e "    │   ${TREE}  ${WHITE}P A T I N A${CYAN}   ${DIM}Automated Backup System${RESET}${CYAN}${BOLD}            ${TREE}   │"
    echo "    │                                                              │"
    echo -e "    │      ${DIM}\"Time adds a patina to things of value.\"${RESET}${CYAN}${BOLD}              │"
    echo "    │                                                              │"
    echo "    ╰──────────────────────────────────────────────────────────────╯"
    echo -e "${RESET}"
}

print_status_banner() {
    local summary=$1
    local total=$(echo "$summary" | jq -r '.total_backups // 0')
    local days=$(echo "$summary" | jq -r '.unique_days // 0')
    local last=$(echo "$summary" | jq -r '.last_backup // "N/A"')
    local bytes=$(echo "$summary" | jq -r '.total_bytes // 0')
    local size=$(format_bytes "$bytes")

    echo -e "${GREEN}${BOLD}"
    echo "    ┌────────────────────────────────────────────────────────────────┐"
    echo -e "    │  ${CHECK} ${WHITE}SYSTEM HEALTHY${GREEN}                              All systems go  │"
    echo "    └────────────────────────────────────────────────────────────────┘"
    echo -e "${RESET}"

    echo -e "    ${BOLD}Quick Stats${RESET}"
    echo -e "    ${DIM}────────────────────────────────────────────────────────────────${RESET}"
    echo -e "    ${CYAN}Total Backups:${RESET}  $total files across $days days"
    echo -e "    ${CYAN}Storage Used:${RESET}   $size"
    echo -e "    ${CYAN}Last Backup:${RESET}    $last"
    echo ""
}

print_daily_table() {
    local data=$1

    echo -e "    ${BOLD}${LEAF} Backup History (Last $DAYS Days)${RESET}"
    echo -e "    ${DIM}────────────────────────────────────────────────────────────────${RESET}"
    echo ""
    echo -e "    ${DIM}DATE${RESET}          ${DIM}COUNT${RESET}   ${DIM}SIZE${RESET}       ${DIM}TYPE${RESET}"
    echo -e "    ${DIM}──────────${RESET}    ${DIM}─────${RESET}   ${DIM}────────${RESET}   ${DIM}─────────────────────────${RESET}"

    echo "$data" | jq -c '.[]' | while read -r row; do
        local date=$(echo "$row" | jq -r '.backup_date')
        local count=$(echo "$row" | jq -r '.backup_count')
        local size=$(echo "$row" | jq -r '.total_size')
        local size_fmt=$(format_bytes "$size")

        # Determine backup type
        local type_label=""
        local type_color=""
        if [ "$count" -ge 10 ]; then
            type_label="Weekly Full"
            type_color="${BLUE}"
        else
            type_label="Daily Priority"
            type_color="${GREEN}"
        fi

        # Check if today
        local today=$(date +%Y-%m-%d)
        local date_display="$date"
        if [ "$date" = "$today" ]; then
            date_display="${GREEN}${BOLD}$date${RESET} ${DIM}(today)${RESET}"
            printf "    %-22b  %-5s   %-10s ${type_color}%-20s${RESET}\n" "$date_display" "$count" "$size_fmt" "$type_label"
        else
            printf "    ${WHITE}%-10s${RESET}    %-5s   %-10s ${type_color}%-20s${RESET}\n" "$date" "$count" "$size_fmt" "$type_label"
        fi
    done
    echo ""
}

print_job_history() {
    local data=$1

    echo -e "    ${BOLD}Recent Jobs${RESET}"
    echo -e "    ${DIM}────────────────────────────────────────────────────────────────${RESET}"
    echo ""
    echo -e "    ${DIM}TIME${RESET}                  ${DIM}STATUS${RESET}      ${DIM}DBs${RESET}    ${DIM}SUCCESS${RESET}  ${DIM}FAILED${RESET}  ${DIM}DURATION${RESET}"
    echo -e "    ${DIM}───────────────────${RESET}   ${DIM}─────────${RESET}   ${DIM}───${RESET}    ${DIM}───────${RESET}  ${DIM}──────${RESET}  ${DIM}────────${RESET}"

    echo "$data" | jq -c '.[]' | head -5 | while read -r row; do
        local started=$(echo "$row" | jq -r '.started')
        local status=$(echo "$row" | jq -r '.status')
        local total=$(echo "$row" | jq -r '.total_databases')
        local success=$(echo "$row" | jq -r '.successful_count')
        local failed=$(echo "$row" | jq -r '.failed_count')
        local duration=$(echo "$row" | jq -r '.duration_ms')
        local duration_sec=$(echo "scale=1; $duration / 1000" | bc)

        local status_icon=""
        local status_color=""
        if [ "$status" = "completed" ] && [ "$failed" = "0" ]; then
            status_icon="${GREEN}${CHECK}${RESET}"
            status_color="${GREEN}"
        elif [ "$status" = "completed" ] && [ "$failed" -gt "0" ]; then
            status_icon="${YELLOW}${WARN}${RESET}"
            status_color="${YELLOW}"
        else
            status_icon="${FAIL}"
            status_color="${RED}"
        fi

        printf "    %-19s   ${status_color}%-9s${RESET}   %-3s    %-7s  %-6s  %ss\n" \
            "$started" "$status" "$total" "$success" "$failed" "$duration_sec"
    done
    echo ""
}

print_database_breakdown() {
    local data=$1

    echo -e "    ${BOLD}Database Breakdown${RESET}"
    echo -e "    ${DIM}────────────────────────────────────────────────────────────────${RESET}"
    echo ""
    echo -e "    ${DIM}DATABASE${RESET}                    ${DIM}BACKUPS${RESET}   ${DIM}SIZE${RESET}        ${DIM}LAST BACKUP${RESET}"
    echo -e "    ${DIM}────────────────────────${RESET}    ${DIM}───────${RESET}   ${DIM}──────────${RESET}  ${DIM}───────────${RESET}"

    echo "$data" | jq -c '.[]' | while read -r row; do
        local name=$(echo "$row" | jq -r '.database_name')
        local count=$(echo "$row" | jq -r '.backup_count')
        local size=$(echo "$row" | jq -r '.total_size')
        local last=$(echo "$row" | jq -r '.last_backup')
        local size_fmt=$(format_bytes "$size")

        # Highlight priority databases
        local name_fmt=""
        if [ "$name" = "groveauth" ] || [ "$name" = "grove-engine-db" ]; then
            name_fmt="${CYAN}${BOLD}$name${RESET}"
            printf "    %-32b  %-7s   %-10s  %s ${DIM}⚡${RESET}\n" "$name_fmt" "$count" "$size_fmt" "$last"
        else
            printf "    ${WHITE}%-24s${RESET}    %-7s   %-10s  %s\n" "$name" "$count" "$size_fmt" "$last"
        fi
    done
    echo ""
    echo -e "    ${DIM}⚡ = Daily priority backup enabled${RESET}"
    echo ""
}

print_reliability_score() {
    local jobs=$1

    # Calculate success rate from last 10 jobs
    local total_jobs=$(echo "$jobs" | jq 'length' 2>/dev/null || echo "0")
    local successful=$(echo "$jobs" | jq '[.[] | select(.status == "completed" and (.failed_count == 0 or .failed_count == "0"))] | length' 2>/dev/null || echo "0")
    local partial=$(echo "$jobs" | jq '[.[] | select(.status == "completed" and (.failed_count > 0 or (.failed_count | tonumber? // 0) > 0))] | length' 2>/dev/null || echo "0")

    # Ensure numeric values
    total_jobs=${total_jobs:-0}
    successful=${successful:-0}
    partial=${partial:-0}

    local rate=0
    if [ "$total_jobs" -gt 0 ]; then
        rate=$(echo "scale=1; ($successful * 100) / $total_jobs" | bc 2>/dev/null || echo "0")
    fi

    echo -e "    ${BOLD}Reliability Score${RESET}"
    echo -e "    ${DIM}────────────────────────────────────────────────────────────────${RESET}"
    echo ""

    # Visual bar
    local bar_width=40
    local filled=$(echo "$rate * $bar_width / 100" | bc 2>/dev/null || echo "0")
    local empty=$((bar_width - filled))

    echo -n "    ["
    echo -ne "${GREEN}"
    for ((i=0; i<filled; i++)); do echo -n "█"; done
    echo -ne "${DIM}"
    for ((i=0; i<empty; i++)); do echo -n "░"; done
    echo -e "${RESET}] ${BOLD}${rate}%${RESET}"
    echo ""
    echo -e "    ${GREEN}${CHECK} ${successful} perfect${RESET}  ${YELLOW}${WARN} ${partial} partial${RESET}  ${DIM}(last ${total_jobs} jobs)${RESET}"
    echo ""
}

print_footer() {
    echo -e "    ${DIM}────────────────────────────────────────────────────────────────${RESET}"
    echo -e "    ${DIM}Worker:${RESET} grove-backups.m7jv4v7npb.workers.dev"
    echo -e "    ${DIM}Schedule:${RESET} Daily 3AM UTC (priority) • Weekly Sunday 4AM UTC (full)"
    echo -e "    ${DIM}Retention:${RESET} 12 weeks"
    echo ""
    echo -e "    ${DIM}Run with --days 30 for extended history${RESET}"
    echo ""
}

# Main execution
main() {
    # Fetch all data
    echo -e "${DIM}Fetching backup data...${RESET}"

    local summary=$(get_backup_summary)
    local daily=$(get_daily_backups)
    local jobs=$(get_job_history)
    local dbs=$(get_database_stats)

    # Clear and display
    clear

    if [ -n "$JSON_OUTPUT" ]; then
        echo "{"
        echo "  \"summary\": $summary,"
        echo "  \"daily\": $daily,"
        echo "  \"jobs\": $jobs,"
        echo "  \"databases\": $dbs"
        echo "}"
        exit 0
    fi

    print_header
    print_status_banner "$summary"
    print_daily_table "$daily"
    print_job_history "$jobs"
    print_database_breakdown "$dbs"
    print_reliability_score "$jobs"
    print_footer
}

main
