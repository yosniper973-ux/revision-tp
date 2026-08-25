#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let result = tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .setup(|app| {
            // L'updater et le redémarrage ne sont branchés que sur les plateformes de bureau.
            #[cfg(desktop)]
            {
                app.handle().plugin(tauri_plugin_updater::Builder::new().build())?;
                app.handle().plugin(tauri_plugin_process::init())?;
            }
            let _ = app;
            Ok(())
        })
        .run(tauri::generate_context!());

    if let Err(e) = result {
        let msg = format!("Erreur au lancement de l'application:\n\n{}", e);
        #[cfg(target_os = "windows")]
        {
            // Write error to log file on desktop
            if let Some(home) = std::env::var_os("USERPROFILE") {
                let log_path = std::path::Path::new(&home).join("Desktop").join("revision-tp-error.log");
                let _ = std::fs::write(&log_path, &msg);
            }
        }
        // Also show a message box on Windows
        #[cfg(target_os = "windows")]
        {
            use std::ffi::OsStr;
            use std::os::windows::ffi::OsStrExt;
            use std::ptr;
            let wide_msg: Vec<u16> = OsStr::new(&msg).encode_wide().chain(Some(0)).collect();
            let wide_title: Vec<u16> = OsStr::new("Révision TP - Erreur").encode_wide().chain(Some(0)).collect();
            unsafe {
                extern "system" {
                    fn MessageBoxW(hwnd: *mut std::ffi::c_void, text: *const u16, caption: *const u16, utype: u32) -> i32;
                }
                MessageBoxW(ptr::null_mut(), wide_msg.as_ptr(), wide_title.as_ptr(), 0x10);
            }
        }
        #[cfg(not(target_os = "windows"))]
        {
            eprintln!("{}", msg);
        }
    }
}
