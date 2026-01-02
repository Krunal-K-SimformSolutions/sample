import UIKit
import React
import React_RCTAppDelegate
import ReactAppDependencyProvider
import MMKV

@main
class AppDelegate: UIResponder, UIApplicationDelegate {
  var window: UIWindow?

  var reactNativeDelegate: ReactNativeDelegate?
  var reactNativeFactory: RCTReactNativeFactory?

  func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
  ) -> Bool {
    let delegate = ReactNativeDelegate()
    let factory = RCTReactNativeFactory(delegate: delegate)
    delegate.dependencyProvider = RCTAppDependencyProvider()

    reactNativeDelegate = delegate
    reactNativeFactory = factory

    // Initialize MMKV
    MMKV.initialize(rootDir: nil)
    // Example of MMKV usage with encryption
    // if let encryptionKey = RNCConfig.env(for: "MMKV_ENCRYPTION_KEY"),
    //    let storageId = RNCConfig.env(for: "MMKV_STORAGE_ID"),
    //    let encryptionKeyData = encryptionKey.data(using: .utf8) {
      
    //   let mmkv = MMKV(mmapID: storageId, cryptKey: encryptionKeyData, mode: .multiProcess)
    //   let currentDate = Date()
    //   let timestampInMilliseconds = Int64(currentDate.timeIntervalSince1970 * 1000)
    //   let timestampString = String(timestampInMilliseconds)
    //   mmkv?.set(timestampString, forKey: "rising-fitness-app-kill-timestamp")
    // }

    window = UIWindow(frame: UIScreen.main.bounds)

    factory.startReactNative(
      withModuleName: "NewProject",
      in: window,
      launchOptions: launchOptions
    )

    return true
  }
}

class ReactNativeDelegate: RCTDefaultReactNativeFactoryDelegate {
  override func sourceURL(for bridge: RCTBridge) -> URL? {
    self.bundleURL()
  }

  override func bundleURL() -> URL? {
#if DEBUG
    RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: "index")
#else
    Bundle.main.url(forResource: "main", withExtension: "jsbundle")
#endif
  }
}
