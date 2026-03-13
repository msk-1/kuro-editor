use serde::{Deserialize, Serialize};
use std::fs;
use std::path::Path;
use tauri_plugin_dialog::DialogExt;

#[derive(Debug, Serialize)]
pub struct FileOpenResult {
    #[serde(rename = "filePath")]
    pub file_path: String,
    #[serde(rename = "fileName")]
    pub file_name: String,
    pub content: String,
}

#[derive(Debug, Serialize)]
pub struct FileSaveResult {
    pub success: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub error: Option<String>,
}

#[derive(Debug, Serialize)]
pub struct FileSaveAsResult {
    pub success: bool,
    #[serde(rename = "filePath")]
    pub file_path: String,
    #[serde(rename = "fileName")]
    pub file_name: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub error: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct FileSaveArgs {
    #[serde(rename = "filePath")]
    pub file_path: String,
    pub content: String,
}

#[derive(Debug, Deserialize)]
pub struct FileSaveAsArgs {
    pub content: String,
    #[serde(rename = "defaultName")]
    pub default_name: String,
}

#[tauri::command]
pub async fn file_open(app: tauri::AppHandle) -> Option<FileOpenResult> {
    let file_path = app
        .dialog()
        .file()
        .add_filter("All Files", &["*"])
        .add_filter(
            "Text Files",
            &["txt", "md", "json", "js", "ts", "jsx", "tsx", "css", "html"],
        )
        .blocking_pick_file();

    match file_path {
        Some(path) => {
            let path_str = path.to_string();
            match fs::read_to_string(&path_str) {
                Ok(content) => {
                    let file_name = Path::new(&path_str)
                        .file_name()
                        .map(|n| n.to_string_lossy().to_string())
                        .unwrap_or_else(|| "Untitled".to_string());
                    Some(FileOpenResult {
                        file_path: path_str,
                        file_name,
                        content,
                    })
                }
                Err(_) => None,
            }
        }
        None => None,
    }
}

#[tauri::command]
pub async fn file_save(args: FileSaveArgs) -> FileSaveResult {
    match fs::write(&args.file_path, &args.content) {
        Ok(_) => FileSaveResult {
            success: true,
            error: None,
        },
        Err(e) => FileSaveResult {
            success: false,
            error: Some(e.to_string()),
        },
    }
}

#[tauri::command]
pub async fn file_save_as(app: tauri::AppHandle, args: FileSaveAsArgs) -> Option<FileSaveAsResult> {
    let file_path = app
        .dialog()
        .file()
        .set_file_name(&args.default_name)
        .add_filter("All Files", &["*"])
        .blocking_save_file();

    match file_path {
        Some(path) => {
            let path_str = path.to_string();
            match fs::write(&path_str, &args.content) {
                Ok(_) => {
                    let file_name = Path::new(&path_str)
                        .file_name()
                        .map(|n| n.to_string_lossy().to_string())
                        .unwrap_or_else(|| "Untitled".to_string());
                    Some(FileSaveAsResult {
                        success: true,
                        file_path: path_str,
                        file_name,
                        error: None,
                    })
                }
                Err(e) => Some(FileSaveAsResult {
                    success: false,
                    file_path: path_str.clone(),
                    file_name: String::new(),
                    error: Some(e.to_string()),
                }),
            }
        }
        None => None,
    }
}
