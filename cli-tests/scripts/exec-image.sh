# Description: Open bash shell on specified docker image
docker run --rm --entrypoint "/bin/bash" -it $1
