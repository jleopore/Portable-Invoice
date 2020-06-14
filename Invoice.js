let moneyFormat = new Intl.NumberFormat('en-US', {style: 'currency', currency: 'USD'});
let digitsSeparator = ",";
let decimalSymbol   = ".";

//optional decimal -> one or more digits -> optional(decimal -> one or more digits)
const floatRegex = /\.?\d+(\.\d+)?/;

const moneyDeformat = numStr => 
  numStr
    .replace(digitsSeparator, "")
    .replace(decimalSymbol, ".")
    .match(floatRegex)?.[0];

const updateLineItem = e => {
  let row = e.target.parentNode;
  let rate = +moneyDeformat(row.querySelector('.rate').innerText);
  let qty = +moneyDeformat(row.querySelector('.quantity').innerText);
  if (isNaN(rate) || isNaN((qty))) 
    return;
  row.querySelector('.price').innerText = moneyFormat.format(rate * qty);
  updateTotal();
}

const updateTotal = () => {
  let subtotal = 0;
  
  document.querySelectorAll('table.line-items tbody tr').forEach( a => {
    let price = +moneyDeformat(a.lastElementChild.innerText);
    if (!isNaN(price)) subtotal += price;
  });

  let unpaidStr = moneyDeformat(document.getElementById("unpaid").innerText);
  let unpaid = (isNaN(unpaidStr)) ? 0 : +unpaidStr   

  let paidStr = moneyDeformat(document.getElementById("paid").innerText);
  let paid = (isNaN(paidStr)) ? 0 : +paidStr

  let total = subtotal + unpaid;
  let due = total - paid;

  document.getElementById('subtotal').innerText = moneyFormat.format(subtotal);
  document.getElementById('total').innerText = moneyFormat.format(total);
  document.querySelectorAll('.due').forEach(a => a.innerText = moneyFormat.format(due));
}

//Add Vendor Logo                         

let logoImg = document.getElementById('logo');
let logoInput = document.getElementById('logo-input');

const addLogoFile = e => {
  let reader = new FileReader();
  let files = e.dataTransfer ? e.dataTransfer.files : e.target.files;
  if (files.length == 0) 
    return;
  reader.onload = e => logoImg.src = e.target.result;  
  reader.readAsDataURL(files[0])
}

logoInput.ondrop = addLogoFile;
logoInput.onchange = addLogoFile;

const cutRow = e => {
  e.target.parentNode.parentNode.remove();
  updateTotal();
}

document.querySelectorAll('.cut').forEach(e => e.onclick = cutRow);

//Add new Line-Item
document.querySelector('.add').onclick = () => {
  let newRow = document.importNode(document.getElementById("new-row").content, true);
  newRow.querySelector('.cut').onclick = cutRow;
  newRow.querySelector('.rate').onblur = updateLineItem;
  newRow.querySelector('.quantity').onblur = updateLineItem;    
  document.querySelector('.line-items tbody').appendChild(newRow);   
}

document.getElementById('paid').onblur = updateTotal;
document.getElementById('unpaid').onblur = updateTotal;

document.getElementById("date").innerText = 
  new Date().toLocaleString('en-US', {
    month: 'long', 
    day: '2-digit', 
    year: 'numeric'});