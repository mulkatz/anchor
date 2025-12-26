# Add project specific ProGuard rules here.
# You can control the set of applied configuration files using the
# proguardFiles setting in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# Preserve line number information for debugging stack traces
-keepattributes SourceFile,LineNumberTable

# Hide the original source file name in stack traces
-renamesourcefileattribute SourceFile

# ============================================
# Capacitor / WebView Rules
# ============================================

# Keep Capacitor plugin classes
-keep class com.getcapacitor.** { *; }
-keep class com.capacitor.** { *; }

# Keep JavaScript interface for WebView
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# Keep WebView client classes
-keepclassmembers class * extends android.webkit.WebViewClient {
    public void *(android.webkit.WebView, java.lang.String);
    public void *(android.webkit.WebView, java.lang.String, android.graphics.Bitmap);
    public boolean *(android.webkit.WebView, java.lang.String);
}

# ============================================
# Firebase Rules
# ============================================

# Keep Firebase classes
-keep class com.google.firebase.** { *; }
-keep class com.google.android.gms.** { *; }

# Firebase Auth
-keepattributes Signature
-keepattributes *Annotation*

# ============================================
# General Android Rules
# ============================================

# Keep native methods
-keepclasseswithmembernames class * {
    native <methods>;
}

# Keep Parcelables
-keepclassmembers class * implements android.os.Parcelable {
    public static final ** CREATOR;
}

# Keep Serializable classes
-keepclassmembers class * implements java.io.Serializable {
    static final long serialVersionUID;
    private static final java.io.ObjectStreamField[] serialPersistentFields;
    private void writeObject(java.io.ObjectOutputStream);
    private void readObject(java.io.ObjectInputStream);
    java.lang.Object writeReplace();
    java.lang.Object readResolve();
}

# ============================================
# Capacitor Plugins
# ============================================

# Voice Recorder Plugin
-keep class com.tchvu3.capacitorvoicerecorder.** { *; }

# Haptics Plugin
-keep class com.capacitorjs.plugins.haptics.** { *; }

# Filesystem Plugin
-keep class com.capacitorjs.plugins.filesystem.** { *; }

# App Plugin
-keep class com.capacitorjs.plugins.app.** { *; }

# Share Plugin
-keep class com.capacitorjs.plugins.share.** { *; }
