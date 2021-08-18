
// const bkg = chrome.extension.getBackgroundPage();
// const console = bkg.console;
// console.log("EVC extension ...");

// document.getElementById("test").addEventListener('click', () => {

//   // console.log("Popup DOM fully loaded and parsed");

// //   chrome.scripting.executeScript({
// //     code: 'console.log("addd")'
// // });

//   function modifyDOM() {
//       //You can play with your DOM here or check URL against your regex
//       console.log('Tab script:');
//       console.log(document.body);
//       return document.body.innerHTML;
//   }

//   //We have permission to access the activeTab, so we can call chrome.tabs.executeScript:
//   chrome.scripting.executeScript({
//     func: modifyDOM
//       // code: '(' + modifyDOM.toString() + ')();' //argument here is a string but function.toString() returns function's code
//   }, (results) => {
//       //Here we have just the innerHTML and not DOM structure
//       console.log('Popup script:')
//       console.log(results[0]);
//   });
// });


function greetUser(name) {
  alert(`Hello, ${name}!`);
}

chrome.action.onClicked.addListener(async (tab) => {
  let userReq = await fetch('https://example.com/user-data.json');
  let user = await userReq.json();
  let givenName = user.givenName || '<GIVEN_NAME>';

  chrome.scripting.executeScript({
    target: {tabId: tab.id},
    func: greetUser,
    args: [givenName],
  });
});