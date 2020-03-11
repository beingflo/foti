use walkdir::WalkDir;
use std::{path::Path, fs, io, io::Write};
use std::process::Command;

const L1_HOME: &'static str = "/home/florian/Pictures";
const L2_HOME: &'static str = "/home/florian/.cache/photos/l2";

fn main() -> Result<(), std::io::Error> {

    for entry in WalkDir::new(L1_HOME).sort_by(|a,b| a.file_name().cmp(b.file_name())) {
        let entry = entry?;

        let l1_path = entry.path();
        let local_path = entry.path().strip_prefix(L1_HOME).unwrap();
        let l2_path = Path::new(L2_HOME).join(local_path);

        if entry.file_type().is_dir() {
            // Mirror directory to L2
            if !l2_path.exists() {
                fs::create_dir(&l2_path).unwrap();
            }
        } else {
            // Generate compressed image
            if !l2_path.exists() {
                println!("Compressing file {}", local_path.display());

                let output = Command::new("bash")
                    .arg("../minify.sh")
                    .arg(l1_path)
                    .arg(l2_path)
                    .output()
                    .expect("Command failed");

                if !output.status.success() {
                    println!("Image compression failed with error:");
                    io::stdout().write_all(&output.stdout).unwrap();
                }
            }
        }
    }

    Ok(())
}
