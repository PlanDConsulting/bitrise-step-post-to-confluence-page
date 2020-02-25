#!/bin/bash

echo "'confluence_host': ${confluence_host}"
echo "'confluence_page_id': ${confluence_page_id}"
echo "'confluence_api_key': ${confluence_api_key}"
echo "'confluence_user_email': ${confluence_user_email}"
echo "IPA path: ${BITRISE_IPA_PATH}"

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
$SCRIPT_DIR/index.js "${confluence_host}" "${confluence_page_id}" "${confluence_api_key}" "${confluence_user_email}" "${BITRISE_IPA_PATH}"