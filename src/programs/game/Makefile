keygen:
	solana-keygen new -o .cfg/game-keypair.json --force

build-program:
	cargo build-sbf --manifest-path=./Cargo.toml --sbf-out-dir=./dist/program

deploy-program:
	solana program-v4 deploy ./dist/program/game.so --program-keypair .cfg/game-keypair.json