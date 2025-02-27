
```sh
cargo build-sbf
```
After each time you build your Solana program, the above command will output the build path of your compiled program's .so file and the default keyfile that will be used for the program's address. 
**`cargo build-sbf` installs the toolchain from the currently installed solana CLI tools.** 

*You may need to upgrade those tools if you encounter any version incompatibilities.* 
*In case you get an error like: error while loading shared libraries: librustc_driver-278a6e01e221f788.soyou may need to go to ~/.cache/solana/ and rm -rf the platform tools there and then run cargo build-sbf again.*

```sh
solana program-v4 deploy target/deploy/hello_world.so --program-keypair ~/.config/solana/hello_world.json
```
