package com.newproject

import android.content.res.Configuration
import android.content.res.Resources
import android.os.Bundle
import android.util.DisplayMetrics
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate

class MainActivity : ReactActivity() {

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  override fun getMainComponentName(): String = "NewProject"

  /**
   * Returns the instance of the [ReactActivityDelegate]. We use [DefaultReactActivityDelegate]
   * which allows you to enable New Architecture with a single boolean flags [fabricEnabled]
   */
  override fun createReactActivityDelegate(): ReactActivityDelegate =
      DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)

  override fun getResources(): Resources {
    var res = super.getResources()
    val config = Configuration(res.configuration)

    if (config.fontScale != 1f) {
      config.fontScale = 1f // Disable font scaling
      val context = createConfigurationContext(config)
      res = context.resources
    }
    return res
  }

  override fun onCreate(savedInstanceState: Bundle?) {
    val metrics: DisplayMetrics = getResources().displayMetrics
    metrics.scaledDensity = metrics.density // Force density scaling to 1
    getResources().updateConfiguration(getResources().configuration, metrics)
    super.onCreate(null) // super.onCreate(null) with react-native-screens
  }
}
