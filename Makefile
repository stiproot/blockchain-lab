sol-download-mpl:
	solana program dump --url mainnet-beta metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s src/programs/metadata.so

sol-run-mpl:
	solana-test-validator --bpf-program metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s src/programs/metadata.so