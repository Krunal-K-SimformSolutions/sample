#!/usr/bin/env bash

_prettytable_char_top_left="┌"
_prettytable_char_horizontal="─"
_prettytable_char_vertical="│"
_prettytable_char_bottom_left="└"
_prettytable_char_bottom_right="┘"
_prettytable_char_top_right="┐"
_prettytable_char_vertical_horizontal_left="├"
_prettytable_char_vertical_horizontal_right="┤"
_prettytable_char_vertical_horizontal_top="┬"
_prettytable_char_vertical_horizontal_bottom="┴"
_prettytable_char_vertical_horizontal="┼"

# Escape codes

# Default colors
_prettytable_color_blue="0;34"
_prettytable_color_green="0;32"
_prettytable_color_cyan="0;36"
_prettytable_color_red="0;31"
_prettytable_color_purple="0;35"
_prettytable_color_yellow="0;33"
_prettytable_color_gray="1;30"
_prettytable_color_light_blue="1;34"
_prettytable_color_light_green="1;32"
_prettytable_color_light_cyan="1;36"
_prettytable_color_light_red="1;31"
_prettytable_color_light_purple="1;35"
_prettytable_color_light_yellow="1;33"
_prettytable_color_light_gray="0;37"

# Somewhat special colors
_prettytable_color_black="0;30"
_prettytable_color_white="1;37"
_prettytable_color_none="0"

function _prettytable_prettify_lines() {
    cat - | sed -e "s@^@${_prettytable_char_vertical}@;s@\$@	@;s@	@	${_prettytable_char_vertical}@g"
}

function _prettytable_fix_border_lines() {
    cat - | sed -e "1s@ @${_prettytable_char_horizontal}@g;3s@ @${_prettytable_char_horizontal}@g;\$s@ @${_prettytable_char_horizontal}@g"
}

function _prettytable_colorize_lines() {
    local color="$1"
    local range="$2"
    local ansicolor="$(eval "echo \${_prettytable_color_${color}}")"

    cat - | sed -e "${range}s@\\([^${_prettytable_char_vertical}]\\{1,\\}\\)@"$'\E'"[${ansicolor}m\1"$'\E'"[${_prettytable_color_none}m@g"
}

function prettytable() {
    local cols="${1}"
    local color="${2:-none}"
    local input="$(cat -)"
    local header="$(echo -e "${input}"|head -n+1)"
    local body="$(echo -e "${input}"|tail -n+2)"
    {
        # Top border
        echo -n "${_prettytable_char_top_left}"
        for i in $(seq 2 ${cols}); do
            echo -ne "\t${_prettytable_char_vertical_horizontal_top}"
        done
        echo -e "\t${_prettytable_char_top_right}"

        echo -e "${header}" | _prettytable_prettify_lines

        # Header/Body delimiter
        echo -n "${_prettytable_char_vertical_horizontal_left}"
        for i in $(seq 2 ${cols}); do
            echo -ne "\t${_prettytable_char_vertical_horizontal}"
        done
        echo -e "\t${_prettytable_char_vertical_horizontal_right}"

        echo -e "${body}" | _prettytable_prettify_lines

        # Bottom border
        echo -n "${_prettytable_char_bottom_left}"
        for i in $(seq 2 ${cols}); do
            echo -ne "\t${_prettytable_char_vertical_horizontal_bottom}"
        done
        echo -e "\t${_prettytable_char_bottom_right}"
    } | column -t -s $'\t' | _prettytable_fix_border_lines | _prettytable_colorize_lines "${color}" "2"
} 

if [[ "$1" =~ ^.*COMMIT_EDITMSG$ ]]; then
  message=$(cat "$1")
else
  message="$1"
fi

if ! echo "$message" | grep -E "^(feat|FTR|fix|FIX|docs|style|CLP|refactor|RFR|perf|test|TST|build|ci|chore|revert|vendor|wip|WIP|security|SCR|CRO):" > /dev/null; then
  echo "❌ Missing or incorrect commit type (feat, fix, chore, etc.)."
fi

if ! echo "$message" | grep -E ":[[:space:]][A-Z0-9]+-[A-Z0-9]+:" > /dev/null; then
  echo "❌ Missing or incorrect ticket ID (e.g., RF-T168)."
fi

if ! echo "$message" | grep -E "[[:space:]][A-Za-z0-9].*$" > /dev/null; then
  echo "❌ Missing or incorrect commit message content after the ticket ID."
fi

echo ""

if ! [[ "$message" =~ ^(feat|FTR|fix|FIX|docs|style|CLP|refactor|RFR|perf|test|TST|build|ci|chore|revert|vendor|wip|WIP|security|SCR|CRO):[[:space:]][A-Z0-9]+-[A-Z0-9]+:[[:space:]][A-Za-z0-9].*$ ]]; then
  echo "Commit message should start with the commit type, followed by Zoho or Asana task-id and task name"
  echo "(example: 'feat: TA1-T123: Enable Client Certificate Support')"
  echo "Select the type of change that you're committing"
  {
    printf 'PREFIX\tTITLE\tDESCRIPTION\tEMOJI😀\n';
    printf '%s\t%s\t%s\t%s\n' "feat/FTR" "Feature" "A new feature for the user, not" "";
    printf '%s\t%s\t%s\t%s\n' "" "" "a new feature for a build script" "   🌟";
    printf '%s\t%s\t%s\t%s\n' "" "" "" "";
    printf '%s\t%s\t%s\t%s\n' "fix/FIX" "Bug Fixes" "A bug fix for the user, not" "";
    printf '%s\t%s\t%s\t%s\n' "" "" "a fix to a build scripts" "   🐛";
    printf '%s\t%s\t%s\t%s\n' "" "" "" "";
    printf '%s\t%s\t%s\t%s\n' "docs" "Documentation" "Documentation only changes" "   📚";
    printf '%s\t%s\t%s\t%s\n' "" "" "" "";
    printf '%s\t%s\t%s\t%s\n' "style/CLP" "Styles" "Changes that do not affect the meaning of the code" "";
    printf '%s\t%s\t%s\t%s\n' "" "" "(white-space, formatting, missing semi-colons, etc)" "   💎";
    printf '%s\t%s\t%s\t%s\n' "" "" "" "";
    printf '%s\t%s\t%s\t%s\n' "refactor/RFR" "Code" "A code change that neither" "";
    printf '%s\t%s\t%s\t%s\n' "" "Refactoring" "fixes a bug nor adds a feature" "   📦";
    printf '%s\t%s\t%s\t%s\n' "" "" "" "";
    printf '%s\t%s\t%s\t%s\n' "perf" "Performance" "A code change that improves performance" "";
    printf '%s\t%s\t%s\t%s\n' "" "Improvements" "" "   🚀";
    printf '%s\t%s\t%s\t%s\n' "" "" "" "";
    printf '%s\t%s\t%s\t%s\n' "test/TST" "Tests" "Adding missing tests or correcting existing tests" "   🚨";
    printf '%s\t%s\t%s\t%s\n' "" "" "" "";
    printf '%s\t%s\t%s\t%s\n' "build" "Builds" "Changes that affect the build system or external" "";
    printf '%s\t%s\t%s\t%s\n' "" "" "dependencies (example scopes - gulp, broccoli, npm)" "   🛠";
    printf '%s\t%s\t%s\t%s\n' "" "" "" "";
    printf '%s\t%s\t%s\t%s\n' "ci" "Continuous" "Changes to our CI configuration files and scripts" "";
    printf '%s\t%s\t%s\t%s\n' "" "Integrations" "(example scopes - Travis, Circle, BrowserStack, SauceLabs)" "   🔅";
    printf '%s\t%s\t%s\t%s\n' "" "" "" "";
    printf '%s\t%s\t%s\t%s\n' "chore" "Chores" "Other changes that don't modify src or" "";
    printf '%s\t%s\t%s\t%s\n' "" "" "test files but updating gulp tasks etc" "   💠";
    printf '%s\t%s\t%s\t%s\n' "" "" "" "";
    printf '%s\t%s\t%s\t%s\n' "revert" "Reverts" "Reverts a previous commit" "   🗑";
    printf '%s\t%s\t%s\t%s\n' "" "" "" "";
    printf '%s\t%s\t%s\t%s\n' "vendor" "Vendor" "Update version for dependencies, packages" "   📦";
    printf '%s\t%s\t%s\t%s\n' "" "" "" "";
    printf '%s\t%s\t%s\t%s\n' "wip/WIP" "Work in" "Has not yet finished his work on" "";
    printf '%s\t%s\t%s\t%s\n' "" "progress" "the code (thus, work in progress)" "   🚧";
    printf '%s\t%s\t%s\t%s\n' "" "" "" "";
    printf '%s\t%s\t%s\t%s\n' "security/SCR" "Security" "Security issue fix" "   🔐";
    printf '%s\t%s\t%s\t%s\n' "" "" "" "";
    printf '%s\t%s\t%s\t%s\n' "CRO" "Content Rate" "Content Rate Optimization" "";
    printf '%s\t%s\t%s\t%s\n' "" "Optimization" "" "   👷";
  } | prettytable 4
  exit 1
fi
