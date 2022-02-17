const {
  default: installExtension,
  REACT_DEVELOPER_TOOLS,
} = require('electron-devtools-installer')
const {app, BrowserWindow, ipcMain, Menu, shell} = require('electron')
const {exec} = require('child_process')
const path = require('path')
const fs = require('fs')

const isMac = process.platform === `darwin`
const dev = true
let win
let assets = {}

process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = `false`

app.commandLine.appendSwitch(`js-flags`, `--expose_gc`)
app.whenReady().then(createWindow)

app.on(`window-all-closed`, () => app.quit())
app.on(`activate`, () => {
  if (!BrowserWindow.getAllWindows().length) {
    createWindow()
  }
})

ipcMain.handle('assets', async () => assets)

const template = [
  // { role: 'appMenu' }
  ...(isMac
    ? [
        {
          label: app.name,
          submenu: [
            {role: 'about'},
            {type: 'separator'},
            {role: 'services'},
            {type: 'separator'},
            {role: 'hide'},
            {role: 'hideOthers'},
            {role: 'unhide'},
            {type: 'separator'},
            {role: 'quit'},
          ],
        },
      ]
    : []),
  {
    label: 'File',
    submenu: [isMac ? {role: 'close'} : {role: 'quit'}],
  },
  {
    label: 'Edit',
    submenu: [
      {role: 'undo'},
      {role: 'redo'},
      {type: 'separator'},
      {role: 'cut'},
      {role: 'copy'},
      {role: 'paste'},
      ...(isMac
        ? [
            {role: 'pasteAndMatchStyle'},
            {role: 'delete'},
            {role: 'selectAll'},
            {type: 'separator'},
            {
              label: 'Speech',
              submenu: [{role: 'startSpeaking'}, {role: 'stopSpeaking'}],
            },
          ]
        : [{role: 'delete'}, {type: 'separator'}, {role: 'selectAll'}]),
    ],
  },
  // { role: 'viewMenu' }
  {
    label: 'View',
    submenu: [
      {role: 'reload'},
      {role: 'forceReload'},
      {role: 'toggleDevTools'},
      {type: 'separator'},
      {role: 'resetZoom'},
      {role: 'zoomIn'},
      {role: 'zoomOut'},
      {type: 'separator'},
      {role: 'togglefullscreen'},
    ],
  },
  // { role: 'windowMenu' }
  {
    label: 'Window',
    submenu: [
      {role: 'minimize'},
      {role: 'zoom'},
      ...(isMac
        ? [
            {type: 'separator'},
            {role: 'front'},
            {type: 'separator'},
            {role: 'window'},
          ]
        : [{role: 'close'}]),
    ],
  },
  {
    label: `Aide`,
    submenu: [
      {
        label: `Admin`,
        click: () =>
          win.loadURL(`http://localhost:3000/admin`).catch(console.log),
      },
      {
        label: `Game`,
        click: () => win.loadURL(`http://localhost:3000`).catch(console.log),
      },
    ],
  },
]

const menu = Menu.buildFromTemplate(template)
Menu.setApplicationMenu(menu)

function createWindow() {
  if (dev) {
    installExtension(REACT_DEVELOPER_TOOLS)
      .then((name) => console.log(`Added Extension:  ${name}`))
      .catch((err) => console.log('An error occurred: ', err))
  }

  createWindowApp()
}

function createWindowApp() {
  if (win) return

  win = new BrowserWindow({
    width: 1280,
    height: 720,
    useContentSize: true,
    title: `RPG`,
    webPreferences: {
      devTools: true,
      nodeIntegration: true,
      experimentalFeatures: true,
      contextIsolation: false,
    },
  })

  load()
}

function load() {
  if (dev) {
    exec('react-scripts start', async (error, stdout, stderr) => {
      if (error) {
        alert(`error: ${error.message}`)
        return
      }
      if (stderr) {
        alert(`stderr: ${stderr}`)
        return
      }

      await listAssets()
      win.loadURL(`http://localhost:3000`).catch(console.log)
    })
  }
}

async function listAssets() {
  const [animals, character, items, skybox, textures] = await Promise.all([
    readdirAsync('animals'),
    readdirAsync('character'),
    readdirAsync('items'),
    readdirAsync('skybox'),
    readdirAsync('textures'),
  ])

  assets = {
    animals,
    character,
    items,
    skybox,
    textures,
  }
}

function readdirAsync(dir) {
  const directoryPath = path.join(__dirname, `public/${dir}`)
  return new Promise(function (resolve, reject) {
    fs.readdir(directoryPath, function (error, result) {
      if (error) {
        reject(error)
      } else {
        resolve(result)
      }
    })
  })
}
