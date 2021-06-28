
require_gh_token () {
  #  Ensure that $GH_TOKEN is in env
  echo "Checking for GH_TOKEN..."
  if [[ -z $GH_TOKEN ]]
  then
  echo "ENV '\$GH_TOKEN' is required to proceed; learn more at https://github.com/lerna/lerna/blob/main/commands/version/README.md#--create-release-type"
  exit 1
  fi

  # Check if token can create a relese
  echo "Checking GH_TOKEN permissions..."
  set -e

  # create a dummy release
  # this is the capability that we will need so let's just check it by trying it
  RELEASE_ID=$(curl --silent --show-error --fail \
  -u :$GH_TOKEN \
  -X POST \
  -H "Accept: application/vnd.github.v3+json" \
  https://api.github.com/repos/tinacms/tinacms/releases \
  -d '{"tag_name": "permission_check", "draft": true}' | jq '.id')

  # cleanup the dummy release
  curl --silent --show-error --fail \
  -u :$GH_TOKEN \
  -X DELETE \
  -H "Accept: application/vnd.github.v3+json" \
  https://api.github.com/repos/tinacms/tinacms/releases/$RELEASE_ID
}