package com.radhafashions.admin;

import android.Manifest;
import android.annotation.SuppressLint;
import android.app.Activity;
import android.app.AlertDialog;
import android.app.DownloadManager;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.graphics.Bitmap;
import android.graphics.Color;
import android.net.ConnectivityManager;
import android.net.NetworkCapabilities;
import android.net.Uri;
import android.net.http.SslError;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.util.Log;
import android.view.KeyEvent;
import android.view.View;
import android.view.Window;
import android.view.WindowManager;
import android.webkit.CookieManager;
import android.webkit.GeolocationPermissions;
import android.webkit.JavascriptInterface;
import android.webkit.JsResult;
import android.webkit.SslErrorHandler;
import android.webkit.URLUtil;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.ProgressBar;
import android.widget.Toast;
import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.contract.ActivityResultContracts;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout;

public class MainActivity extends AppCompatActivity {
    private static final String TAG = "RadhaAdmin";
    private static final String ADMIN_URL = "https://radhafashions.in/admin";
    private static final String PREFS_NAME = "radha_admin_prefs";
    private static final String KEY_LAST_ORDER_COUNT = "last_order_count";
    private static final int PERMISSION_REQUEST_CODE = 100;
    private WebView webView;
    private ProgressBar progressBar;
    private SwipeRefreshLayout swipeRefresh;
    private ValueCallback<Uri[]> fileUploadCb;
    private SharedPreferences prefs;

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        requestWindowFeature(Window.FEATURE_NO_TITLE);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
            getWindow().getAttributes().layoutInDisplayCutoutMode =
                WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_SHORT_EDGES;
        }
        setContentView(R.layout.activity_main);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            getWindow().setStatusBarColor(Color.parseColor("#1a1a2e"));
        }
        prefs = getSharedPreferences(PREFS_NAME, MODE_PRIVATE);
        progressBar = findViewById(R.id.progressBar);
        swipeRefresh = findViewById(R.id.swipeRefreshLayout);
        webView = findViewById(R.id.webView);
        swipeRefresh.setColorSchemeColors(Color.parseColor("#e91e63"));
        swipeRefresh.setOnRefreshListener(() -> webView.reload());
        setupWebView();
        requestNotificationPermission();
        startOrderPollingService();
        if (isNetworkAvailable()) webView.loadUrl(ADMIN_URL);
        else showNoInternetDialog();
    }

    private void requestNotificationPermission() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            if (ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS)
                    != PackageManager.PERMISSION_GRANTED) {
                ActivityCompat.requestPermissions(this,
                    new String[]{Manifest.permission.POST_NOTIFICATIONS}, PERMISSION_REQUEST_CODE);
            }
        }
    }

    private void startOrderPollingService() {
        Intent serviceIntent = new Intent(this, OrderPollingService.class);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            startForegroundService(serviceIntent);
        } else {
            startService(serviceIntent);
        }
    }

    @SuppressLint("SetJavaScriptEnabled")
    private void setupWebView() {
        WebSettings s = webView.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setDatabaseEnabled(true);
        s.setAllowFileAccess(true);
        s.setCacheMode(WebSettings.LOAD_DEFAULT);
        s.setAppCacheEnabled(true);
        s.setAppCachePath(getApplicationContext().getCacheDir().getAbsolutePath());
        s.setUseWideViewPort(true);
        s.setLoadWithOverviewMode(true);
        s.setSupportZoom(true);
        s.setBuiltInZoomControls(true);
        s.setDisplayZoomControls(false);
        s.setMediaPlaybackRequiresUserGesture(false);
        s.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
        s.setSupportMultipleWindows(false);
        s.setAllowFileAccessFromFileURLs(true);
        s.setAllowUniversalAccessFromFileURLs(true);
        String ua = s.getUserAgentString();
        if (!ua.contains("RadhaAdmin")) s.setUserAgentString(ua + " RadhaAdmin/2.0");
        CookieManager.getInstance().setAcceptCookie(true);
        CookieManager.getInstance().setAcceptThirdPartyCookies(webView, true);
        webView.addJavascriptInterface(new JsBridge(), "AndroidBridge");

        webView.setWebViewClient(new WebViewClient() {
            @Override public void onPageStarted(WebView v, String u, Bitmap f) {
                super.onPageStarted(v, u, f);
                progressBar.setVisibility(View.VISIBLE);
            }
            @Override public void onPageFinished(WebView v, String u) {
                super.onPageFinished(v, u);
                progressBar.setVisibility(View.GONE);
                swipeRefresh.setRefreshing(false);
                injectAdminStyles(v);
                injectOrderPolling(v);
            }
            @Override public boolean shouldOverrideUrlLoading(WebView v, WebResourceRequest req) {
                String url = req.getUrl().toString();
                if (url.contains("radhafashions.in")) return false;
                if (url.startsWith("tel:")) {
                    startActivity(new Intent(Intent.ACTION_DIAL, Uri.parse(url)));
                    return true;
                }
                if (url.startsWith("mailto:")) {
                    startActivity(new Intent(Intent.ACTION_SENDTO, Uri.parse(url)));
                    return true;
                }
                if (url.contains("wa.me/") || url.contains("api.whatsapp.com")) {
                    try { startActivity(new Intent(Intent.ACTION_VIEW, Uri.parse(url))); }
                    catch (Exception e) {
                        Toast.makeText(MainActivity.this, "WhatsApp not installed", Toast.LENGTH_SHORT).show();
                    }
                    return true;
                }
                if (url.startsWith("http://") || url.startsWith("https://")) {
                    startActivity(new Intent(Intent.ACTION_VIEW, Uri.parse(url)));
                    return true;
                }
                return false;
            }
            @Override public void onReceivedError(WebView v, WebResourceRequest req, WebResourceError err) {
                super.onReceivedError(v, req, err);
                if (req.isForMainFrame()) {
                    progressBar.setVisibility(View.GONE);
                    swipeRefresh.setRefreshing(false);
                }
            }
            @Override public void onReceivedSslError(WebView v, SslErrorHandler h, SslError e) {
                new AlertDialog.Builder(MainActivity.this)
                    .setTitle("SSL Error")
                    .setMessage("Continue?")
                    .setPositiveButton("Yes", (d, w) -> h.proceed())
                    .setNegativeButton("No", (d, w) -> h.cancel())
                    .show();
            }
        });

        webView.setWebChromeClient(new WebChromeClient() {
            @Override public void onProgressChanged(WebView v, int p) {
                progressBar.setProgress(p);
                if (p == 100) progressBar.setVisibility(View.GONE);
            }
            @Override public boolean onJsAlert(WebView v, String u, String m, JsResult r) {
                new AlertDialog.Builder(MainActivity.this)
                    .setTitle("Radha Fashions").setMessage(m)
                    .setPositiveButton("OK", (d, w) -> r.confirm())
                    .setCancelable(false).show();
                return true;
            }
            @Override public boolean onJsConfirm(WebView v, String u, String m, JsResult r) {
                new AlertDialog.Builder(MainActivity.this)
                    .setTitle("Radha Fashions").setMessage(m)
                    .setPositiveButton("OK", (d, w) -> r.confirm())
                    .setNegativeButton("Cancel", (d, w) -> r.cancel())
                    .setCancelable(false).show();
                return true;
            }
            @Override public boolean onShowFileChooser(WebView wv, ValueCallback<Uri[]> cb, FileChooserParams p) {
                if (fileUploadCb != null) fileUploadCb.onReceiveValue(null);
                fileUploadCb = cb;
                try { fileUploadLauncher.launch(p.createIntent()); }
                catch (Exception e) { fileUploadCb = null; return false; }
                return true;
            }
            @Override public void onGeolocationPermissionsShowPrompt(String o, GeolocationPermissions.Callback cb) {
                cb.invoke(o, true, false);
            }
            @Override public boolean onConsoleMessage(ConsoleMessage m) { return true; }
        });

        webView.setOnLongClickListener(v -> {
            WebView.HitTestResult r = webView.getHitTestResult();
            if (r.getType() == WebView.HitTestResult.IMAGE_TYPE
                    || r.getType() == WebView.HitTestResult.SRC_IMAGE_ANCHOR_TYPE) {
                String img = r.getExtra();
                if (img != null) { downloadImage(img); return true; }
            }
            return false;
        });
        webView.setLongClickable(true);
    }

    private final ActivityResultLauncher<Intent> fileUploadLauncher =
        registerForActivityResult(new ActivityResultContracts.StartActivityForResult(), result -> {
            if (fileUploadCb != null) {
                Uri[] results = null;
                if (result.getResultCode() == Activity.RESULT_OK && result.getData() != null) {
                    String data = result.getData().getDataString();
                    if (data != null) results = new Uri[]{Uri.parse(data)};
                }
                fileUploadCb.onReceiveValue(results);
                fileUploadCb = null;
            }
        });

    private void injectAdminStyles(WebView v) {
        String js = "javascript:(function(){var s=document.createElement('style');"
            + "s.textContent='nav{display:none!important;}footer{display:none!important;}"
            + ".hero,.banner,[class*=Hero],[class*=Banner]{display:none!important;}"
            + "[class*=CartDrawer]{display:none!important;}"
            + "[class*=Testimonial],[class*=OurStory]{display:none!important;}'"
            + ";document.head.appendChild(s);})()";
        v.evaluateJavascript(js, null);
    }

    private void injectOrderPolling(WebView v) {
        String js = "javascript:(function(){"
            + "if(window.__orderPollingActive)return;"
            + "window.__orderPollingActive=true;"
            + "window.__lastOrderCount=-1;"
            + "function poll(){"
            + "fetch('/api/orders',{credentials:'same-origin',headers:{'Accept':'application/json'}})"
            + ".then(function(r){if(r.ok)return r.json();throw new Error(r.status);})"
            + ".then(function(data){"
            + "var count=Array.isArray(data)?data.length:0;"
            + "if(window.__lastOrderCount>=0&&count>window.__lastOrderCount){"
            + "try{AndroidBridge.onNewOrderCount(window.__lastOrderCount,count);}catch(e){}"
            + "}"
            + "window.__lastOrderCount=count;"
            + "})"
            + ".catch(function(e){console.log('OrderPoll:',e);});}"
            + "setInterval(poll,30000);poll();})()";
        v.evaluateJavascript(js, null);
        Log.d(TAG, "Order polling JS injected");
    }

    public class JsBridge {
        @JavascriptInterface
        public void onNewOrderCount(int previousCount, int newCount) {
            Log.d(TAG, "JS: new orders " + previousCount + " -> " + newCount);
            runOnUiThread(() -> {
                NotificationHelper.showOrderNotification(
                    MainActivity.this, previousCount, newCount);
                prefs.edit().putInt(KEY_LAST_ORDER_COUNT, newCount).apply();
            });
        }
        @JavascriptInterface
        public void showToast(String message) {
            runOnUiThread(() -> Toast.makeText(MainActivity.this, message, Toast.LENGTH_SHORT).show());
        }
    }

    private void downloadImage(String url) {
        try {
            DownloadManager.Request req = new DownloadManager.Request(Uri.parse(url));
            req.setTitle("Downloading image");
            req.setNotificationVisibility(
                DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED);
            req.setDestinationInExternalPublicDir(Environment.DIRECTORY_DOWNLOADS,
                URLUtil.guessFileName(url, null, null));
            DownloadManager dm = (DownloadManager) getSystemService(Context.DOWNLOAD_SERVICE);
            if (dm != null) {
                dm.enqueue(req);
                Toast.makeText(this, "Download started", Toast.LENGTH_SHORT).show();
            }
        } catch (Exception e) {
            Toast.makeText(this, "Download failed", Toast.LENGTH_SHORT).show();
        }
    }

    private boolean isNetworkAvailable() {
        ConnectivityManager cm = (ConnectivityManager) getSystemService(CONNECTIVITY_SERVICE);
        if (cm != null) {
            NetworkCapabilities nc = cm.getNetworkCapabilities(cm.getActiveNetwork());
            return nc != null && (nc.hasTransport(NetworkCapabilities.TRANSPORT_WIFI)
                || nc.hasTransport(NetworkCapabilities.TRANSPORT_CELLULAR)
                || nc.hasTransport(NetworkCapabilities.TRANSPORT_ETHERNET));
        }
        return false;
    }

    private void showNoInternetDialog() {
        new AlertDialog.Builder(this)
            .setTitle("No Internet Connection")
            .setMessage("Please check your connection and try again.")
            .setPositiveButton("Retry", (d, w) -> {
                if (isNetworkAvailable()) webView.loadUrl(ADMIN_URL);
                else showNoInternetDialog();
            })
            .setNegativeButton("Exit", (d, w) -> finish())
            .setCancelable(false).show();
    }

    @Override public void onBackPressed() {
        if (webView.canGoBack()) webView.goBack();
        else new AlertDialog.Builder(this)
            .setTitle("Exit Admin").setMessage("Exit?")
            .setPositiveButton("Exit", (d, w) -> finish())
            .setNegativeButton("Cancel", null).show();
    }

    @Override public boolean onKeyDown(int k, KeyEvent e) {
        if (k == KeyEvent.KEYCODE_BACK && webView.canGoBack()) {
            webView.goBack();
            return true;
        }
        return super.onKeyDown(k, e);
    }

    @Override protected void onResume() {
        super.onResume();
        webView.onResume();
    }

    @Override protected void onPause() {
        super.onPause();
        webView.onPause();
    }

    @Override protected void onDestroy() {
        if (webView != null) webView.destroy();
        super.onDestroy();
    }

    @Override protected void onSaveInstanceState(Bundle o) {
        super.onSaveInstanceState(o);
        webView.saveState(o);
    }

    @Override protected void onRestoreInstanceState(Bundle s) {
        super.onRestoreInstanceState(s);
        webView.restoreState(s);
    }
}
