#!/bin/bash

set -euo pipefail

usage() {
  echo "Usage: $0 <private_key_file> <user@host>"
  echo
  echo "Example:"
  echo "  $0 tests/ssh-keys/id_ecdsa_p256 user@100.64.2.122"
  echo
  echo "Notes:"
  echo "  - Connects on port 2222"
  echo "  - Ignores known_hosts and disables ssh-agent identities"
  exit 1
}

if [[ $# -lt 2 ]] || [[ "$1" == "-h" ]] || [[ "$1" == "--help" ]]; then
  usage
fi

ssh -i $1 -o IdentitiesOnly=yes -o UserKnownHostsFile=/dev/null -o StrictHostKeyChecking=no -o GlobalKnownHostsFile=/dev/null -o PreferredAuthentications=publickey -o PubkeyAuthentication=yes -o IdentityAgent=none $2 -p 2222 -vvvvv