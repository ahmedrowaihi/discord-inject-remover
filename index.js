const { execSync } = require("child_process");
const fs = require("fs");
const { join } = require("path");
const readline = require("readline");

const ProcessPath = process.cwd();

function main() {
  execSync("cls", { stdio: "inherit" });
  const DiscordContent = "module.exports = require('./core.asar');";
  const regex = [
    new RegExp("app-1\\.\\d\\.\\d", "i"),
    new RegExp("discord_desktop_core-\\d", "i"),
  ];

  if (!fs.existsSync("./file")) fs.mkdirSync("./file");

  const local = process.env.LOCALAPPDATA;
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question(
    "This program will restart your Discord(s), do you want to continue (y/n)?: ",
    (b) => {
      if (b.toLowerCase() === "y") {
        rl.close();
        traverse(local, DiscordContent, regex);
      } else if (b.toLowerCase() === "n") {
        console.log("Closing the program.");
        process.exit(0);
      } else {
        console.log("Please respond with y or n.");
        process.exit(1);
      }
    }
  );
}

function traverse(local, DiscordContent, regex) {
  fs.readdirSync(local).forEach((entry) => {
    if (!entry.includes("iscord")) return;
    console.log(`${entry} found! Checking...`);
    check(join(local, entry), DiscordContent, regex);
  });
}

function check(path, DiscordContent, regex) {
  const local = process.env.LOCALAPPDATA;
  const Discord = path.split("\\")[5];
  console.log(`Checking ${Discord}...`);
  fs.readdirSync(path).forEach((entry) => {
    if (!entry.match(regex[0])) return;
    path = join(path, entry, "modules");

    fs.readdirSync(path).forEach((entry) => {
      if (!entry.match(regex[1])) return;
      path = join(path, entry, "discord_desktop_core", "index.js");

      const n = fs.readFileSync(path, { encoding: "utf-8" });
      if (n !== DiscordContent) {
        fs.copyFileSync(path, join(ProcessPath, "file", `${Discord}_index.js`));
        console.log(
          `The content of ${Discord} is suspicious, please check /file/${Discord}_index.js\nChanging the index...`
        );
        fs.writeFileSync(path, DiscordContent);
        console.log(`${Discord} made safe!\nRestarting ${Discord}....`);
        redem(Discord, local);
      } else console.log(`The content of ${Discord} is normal :D`);
    });
  });
}

function redem(Discord, local) {
  const killList = execSync("tasklist").toString().split("\r\n");
  if (killList.includes(`${Discord}.exe`)) {
    execSync(`taskkill /IM ${Discord}.exe /F`);
  } else {
    console.log(`${Discord} is not present in the list of processes..`);
  }
  console.log(`Starting ${Discord}`);
  execSync(
    join(local, Discord, "Update.exe") + ` --processStart ${Discord}.exe`
  );
}

main();
