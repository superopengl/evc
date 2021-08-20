console.log('EVC injected');

const data = [];

function handleCapture() {
  const targetNode = document.querySelector('#overlap-manager-root tbody > tr:nth-of-type(1) > td:nth-of-type(2)');
  if (targetNode) {
    const match = targetNode.innerText.match(/\((.*)\)/);
    if (match) {
      const number = +match[1];
      updateContextMenu(number);
    }
  }
}

function createMenuItem(sourceNode, label, className, onClick) {
  const menuItem = sourceNode.cloneNode(true);
  menuItem.classList.add(className);
  menuItem.querySelector('td:nth-of-type(1) span').innerHTML = '<small><strong>EVC</strong></small>';
  menuItem.querySelector('td:nth-of-type(2) span').innerText = label;
  menuItem.addEventListener('click', () => onClick());
  return menuItem;
}

let supportLoDatapoint = '';
let supportHiDatapoint = '';
let resistanceLoDatapoint = '';
let resistanceHiDatapoint = '';

function renderLoHiPair(lo, hi) {
  return `${Math.min(lo, hi)}~${Math.max(lo, hi)}`;
}

function updateContextMenu(number) {
  const menuBodyNode = document.querySelector('#overlap-manager-root tbody');
  if (menuBodyNode) {
    const menuItems = [];
    const symbol = document.getElementById('header-toolbar-symbol-search')?.innerText;
    const sourceNode = menuBodyNode.querySelector('tr');

    const supportHiItem = createMenuItem(sourceNode, `Support High (${number})`, 'evc-menu-item-support',
      () => {
        supportHiDatapoint = number;
        closeContextMenu();
      });
    menuItems.push(supportHiItem);

    const supportLoItem = createMenuItem(sourceNode, `Support Low (${number})`, 'evc-menu-item-support',
      () => {
        supportLoDatapoint = number;
        closeContextMenu();
      });
    menuItems.push(supportLoItem);

    if (supportLoDatapoint || supportHiDatapoint) {
      const supportSaveItem = createMenuItem(sourceNode, `Save as Support (${renderLoHiPair(supportLoDatapoint || supportHiDatapoint, number)})`, 'evc-menu-item-support',
        () => {
          supportLoDatapoint = supportLoDatapoint || number;
          supportHiDatapoint = supportHiDatapoint || number;
          trySaveSupport(symbol);
        });
      menuItems.push(supportSaveItem);
    }

    const resistanceHiItem = createMenuItem(sourceNode, `Resistance High (${number})`,  'evc-menu-item-resistance', 
    () => {
      resistanceHiDatapoint = number;
      closeContextMenu();
    });
    menuItems.push(resistanceHiItem);

    const resistanceLoItem = createMenuItem(sourceNode, `Resistance Low (${number})`, 'evc-menu-item-resistance', 
    () => {
      resistanceLoDatapoint = number;
      closeContextMenu();
    });
    menuItems.push(resistanceLoItem);


    if (resistanceLoDatapoint || resistanceHiDatapoint) {
      const resistanceLoItem = createMenuItem(sourceNode, `Save as Resistance (${renderLoHiPair(number, resistanceLoDatapoint || resistanceHiDatapoint)})`, 'evc-menu-item-resistance', 
      () => {
        resistanceLoDatapoint = resistanceLoDatapoint || number;
        resistanceHiDatapoint = resistanceHiDatapoint || number;
        trySaveResistance(symbol);
      });
      menuItems.push(resistanceLoItem);
    }

    if (data.length) {
      const saveItem = createMenuItem(sourceNode, `Download csv (${data.length} rows)`, 'evc-menu-item', () => handleDownloadCsv());
      menuItems.push(saveItem);
    }

    menuBodyNode.prepend(...menuItems);
  }
}

function trySaveSupport(symbol) {
  if (supportLoDatapoint && supportHiDatapoint) {
    data.push({
      symbol,
      support: `${supportLoDatapoint}-${supportHiDatapoint}`
    });
    supportLoDatapoint = '';
    supportHiDatapoint = '';
  }
  closeContextMenu();
}

function trySaveResistance(symbol) {
  if (resistanceLoDatapoint && resistanceHiDatapoint) {
    data.push({
      symbol,
      support: `${resistanceLoDatapoint}-${resistanceHiDatapoint}`
    });
    resistanceLoDatapoint = '';
    resistanceHiDatapoint = '';
  }
  closeContextMenu();
}

function restoreData(number, type) {

  if (symbol && (number || number === 0)) {
    // 
    const item = (type === 'support') ? { symbol, support: number } : { symbol, resistance: number };
    data.push(item);
  }

  closeContextMenu();
}

function closeContextMenu() {
  document.getElementById('overlap-manager-root').innerHTML = '';
}

function handleDownloadCsv() {
  closeContextMenu();
  const dataRows = data.map(x => `${x.symbol},${x.support ?? ''},${x.resistance ?? ''}`).join('\n');
  const csvData = `Symbol,Support,Resistance\n` + dataRows;
  console.log(csvData);

  window.open('data:text/csv;charset=utf-8,' + escape(csvData));
}

function initContextMenuObserver(targetNode) {
  // const targetNode = document.getElementById('overlap-manager-root');
  const config = { attributes: false, childList: true, subtree: false };
  const menuObserverCallback = function (mutationsList, observer) {
    handleCapture();
  };

  // console.log('init', targetNode);
  const observer = new MutationObserver(menuObserverCallback);
  observer.observe(targetNode, config);

  handleCapture();

  return observer;
}

window.addEventListener('load', () => {

  const config = { attributes: false, childList: true, subtree: true };
  const bodyObserverCallback = function (mutationsList, observer) {
    // console.log('body', mutationsList);
    for (const mutation of mutationsList) {
      if (mutation.type === 'childList' && mutation.target.id === 'overlap-manager-root') {
        observer.disconnect();
        initContextMenuObserver(mutation.target);
        break;
      }
    }
  };
  const observer = new MutationObserver(bodyObserverCallback);
  observer.observe(document.body, config);

  // console.log(observer);
}, false);

