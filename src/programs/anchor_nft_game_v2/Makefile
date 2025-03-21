build-prgram:
	anchor build

anchor-deploy-program:
	anchor program deploy target/deploy/nft_game.so --program-v4

sol-deploy-program:
	solana program-v4 deploy ./target/deploy/nft_game.so --program-keypair ./target/deploy/nft_game-keypair.json

sol-deploy-existing-program:
	solana program-v4 deploy --program-id ./target/deploy/nft_game-keypair.json ./target/deploy/nft_game.so
