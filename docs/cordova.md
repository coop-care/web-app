# Install Requirements for Cordova

## macOS

Tested on macOS Catalina.  
[Start with reading this guide](https://v1.quasar.dev/quasar-cli/developing-cordova-apps/preparation) and with running `npm install -g cordova`.  

### Android

* install Android Studio
  * then edit path variable e.g. in `~/.bash_profile`:

		```
		export ANDROID_HOME="$HOME/Library/Android/sdk"  
		export ANDROID_SDK_ROOT="$HOME//Library/Android/sdk"  
		export PATH=$PATH:$ANDROID_SDK_ROOT/tools; PATH=$PATH:$ANDROID_SDK_ROOT/platform-tools
		```

* install Java JDK 8:

	* Intel Chip: [check out this guide](https://mkyong.com/java/how-to-install-java-on-mac-osx/#homebrew-install-java-8-on-macos)
	  * `brew install openjdk@8`
	  * `sudo ln -sfn /usr/local/opt/openjdk@8/libexec/openjdk.jdk /Library/Java/JavaVirtualMachines/openjdk-8.jdk`
	  * `source ~/.bash_profile` (when using bash) or `source ~/.zshrc` (using zsh), then `java -version`
	  * edit path variable, depending on default shell either in `~/.bash_profile` (bash) or `~/.zshrc` (zsh):
	
			```
			export PATH=/usr/local/opt/openjdk@8/bin:$PATH
			export JAVA_HOME=`/usr/libexec/java_home -v 1.8`
			```
	*	Apple Chip: [Try to download and install Java 8 (LTS) from Azul](https://www.azul.com/downloads/?os=macos&architecture=arm-64-bit&package=jdk)

* `brew install gradle`
* check `cordova requirements`if anything is still missing and fix it
* [setup an emulator in Android Studio](https://developer.android.com/studio/run/managing-avds.html)
* hacks for macOS on arm64 architecture (Apple Chip):
	* `ln -s ~/Library/Android/sdk/emulator/qemu/darwin-aarch64 ~/Library/Android/sdk/emulator/qemu/darwin-x86_64` solves error `"Could not launch '/Users/username/Library/Android/sdk/tools/../emulator/qemu/darwin-x86_64/qemu-system-aarch64': No such file or directory"`

### iOS

* install Xcode including Developer Tools
* `npm install -g ios-deploy`
* no need to switch to WKWebView using a plugin as it has become the default from cordova-ios version 6!

### … finally

Run `cordova requirements` in `src-cordova` to check if everything is installed correctly.