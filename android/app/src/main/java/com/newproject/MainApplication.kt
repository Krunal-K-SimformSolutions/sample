package com.newproject

import android.app.Application
import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactHost
import com.facebook.react.ReactNativeApplicationEntryPoint.loadReactNative
import com.facebook.react.defaults.DefaultReactHost.getDefaultReactHost
import com.tencent.mmkv.MMKV

class MainApplication : Application(), ReactApplication {

  override val reactHost: ReactHost by lazy {
    getDefaultReactHost(
      context = applicationContext,
      packageList =
        PackageList(this).packages.apply {
          // Packages that cannot be autolinked yet can be added manually here, for example:
          // add(MyReactNativePackage())
        },
    )
  }

  override fun onCreate() {
    super.onCreate()
    MMKV.initialize(this)
    loadReactNative(this)

    // Example of mmkv used
    // val encryptionKey = BuildConfig.MMKV_ENCRYPTION_KEY
    // val storageId = BuildConfig.MMKV_STORAGE_ID
    // val kv = MMKV.mmkvWithID(storageId, MMKV.MULTI_PROCESS_MODE, encryptionKey)
    // kv.putString("rising-fitness-app-kill-timestamp", Date().time.toString())
  }
}
