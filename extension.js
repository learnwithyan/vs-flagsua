var vscode = require('vscode');
const fs = require('fs');
const path = require('path');

//extId
var extId = 'learnwithyan.flagsua';
var extName = 'flagsua';

let myStatusBarItem = vscode.window.createStatusBarItem(
  vscode.StatusBarAlignment.Right,
  100
);

function activate(context) {
  // get user language
  let language = vscode.env.language;

  // update extension message
  updateStatusBar();

  // Watch for configuration changes
  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration(() => {
      updateStatusBar();
    })
  );
}
exports.activate = activate;

function deactivate() {
  myStatusBarItem.hide();
}
exports.deactivate = deactivate;

// function helpers
function updateStatusBar() {
  const config = vscode.workspace.getConfiguration(extName);
  let updatedValue = config.get('showMsg');

  if (updatedValue === '') {
    updatedValue = 'Pray for Ukraine';
  }

  myStatusBarItem.text = '🇺🇦 ' + updatedValue;
  myStatusBarItem.show();
}

// ext helpers
function infoMsg(vscode, msg, counter = '') {
  countStatusBarItem(vscode, counter);
  vscode.window.showInformationMessage(msg);
}
function warnMsg(vscode, msg, counter = '') {
  countStatusBarItem(vscode, counter);
  vscode.window.showWarningMessage(msg);
}

//read markdown text
function markdownToObject(markdownText) {
  const regexblocks = /#(.*?)#/gs;
  const matches = markdownText.match(regexblocks);

  //check for regular text we used first symbol as "- "
  const regexchecktext = /#(.+?)\n\n((?![\-|]).*)/;
  const regexgettext = /#(.+?)\n\n((?![\-|]).*)/;

  //check for list we used first symbol as "- "
  const regexchecklist = /#.+?\n\n*?- /;
  const regexgetlist = /# (.+?)\n\n([\s\S]+?)#/;
  //check for table (not used) we used first symbol as "|"
  const regexchecktable = /#.+?\n\n*?\|/;
  const regexgettable = /# (.+?)\n\n([\s\S]+?)#/;

  let obj = {};

  if (matches) {
    matches.forEach((match) => {
      let block = match.trim();
      if (regexchecklist.test(block) === true) {
        const matchlist = block.match(regexgetlist);
        const matchlistTitle = matchlist[1].trim();
        const matchlistArr = matchlist[2].split('\n- ').map((line) => {
          line = line.replace('- ', '').trim();
          return '<li>' + line.replace(',') + '</li>';
        });
        obj.lists = [];
        obj.lists['<h3>' + matchlistTitle + '</h3>'] =
          '<ul>' + matchlistArr.join(' ') + '</ul>';
      }
      if (regexchecktext.test(block) === true) {
        const matchtext = block.match(regexgettext);
        const matchtextTitle = matchtext[1].trim();
        const matchtextArr = matchtext[2].trim();
        if (obj.hasOwnProperty('texts')) {
          obj.texts['<h2>' + matchtextTitle + '</h2>'] =
            '<p>' + matchtextArr + '</p>';
        } else {
          obj.texts = [];
          obj.texts['<h1>' + matchtextTitle + '</h1>'] =
            '<p>' + matchtextArr + '</p>';
        }
      }
      //work with table
      // if (regexchecktable.test(block) === true) {
      //   const matchtable = block.match(regexgettable);
      //   // console.log(matchtable);
      // }
    });
    return obj;
  }
}
