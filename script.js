'use strict';

const account1 = {
	owner: 'Filip Golubovic',
	movements: [200, 450, -400, 3000, -650, -130, 70, 1300],
	movementsDates: [
		'2019-11-18T21:31:17.178Z',
		'2019-12-23T07:42:02.383Z',
		'2020-01-28T09:15:04.904Z',
		'2020-04-01T10:17:24.185Z',
		'2020-05-08T14:11:59.604Z',
		'2020-05-27T17:01:17.194Z',
		'2020-07-11T23:36:17.929Z',
		'2020-07-12T10:51:36.790Z',
	],
	interestRate: 1.2, // %
	pin: 1111,
};

const account2 = {
	owner: 'Jovana Jovanovic',
	movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
	movementsDates: [
		'2019-11-01T13:15:33.035Z',
		'2019-11-30T09:48:16.867Z',
		'2019-12-25T06:04:23.907Z',
		'2020-01-25T14:18:46.235Z',
		'2020-02-05T16:33:06.386Z',
		'2020-04-10T14:43:26.374Z',
		'2020-06-25T18:49:59.371Z',
		'2020-07-26T12:01:20.894Z',
	],
	interestRate: 1.5,
	pin: 2222,
};

const accounts = [account1, account2];

// Elementi
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance-value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

const currencies = new Map([
	['USD', 'United States dollar'],
	['EUR', 'Euro'],
	['GBP', 'Pound sterling'],
]);

const movements = [200, 450, -400, 3000, -650, -130, 70, 1300];

//display all movements
const displayMovements = function (acc, sort = false) {
	containerMovements.innerHTML = '';

	const movs = sort
		? acc.movements.slice().sort((a, b) => a - b)
		: acc.movements;

	movs.forEach(function (mov, i) {
		const type = mov > 0 ? 'deposit' : 'withdrawal';

		const date = new Date(acc.movementsDates[i]);

		const day = `${date.getDate()}`.padStart(2, 0);
		const month = `${date.getMonth() + 1}`.padStart(2, 0);
		const year = date.getFullYear();

		const displayDate = `${day}/${month}/${year}`;

		const html = `<div class="movements__row">
        <div class="movements__type movements__type--${type}">
            ${i + 1} ${type}
        </div>
        <div class="movements__date">${displayDate}</div>
        <div class="movements__value">${mov}???</div>
        </div>`;

		containerMovements.insertAdjacentHTML('afterbegin', html);
	});
};

//calculate balance and display it
const calcPrintBalans = function (account) {
	account.balance = account.movements.reduce((acc, curr) => acc + curr, 0);
	labelBalance.textContent = `${account.balance} EUR`;
};

//Calculate and display summary
const calcDisplaySummary = function (account) {
	const income = account.movements
		.filter((mov) => mov > 0)
		.reduce((acc, curr) => acc + curr, 0);
	labelSumIn.textContent = `${income}???`;

	const out = account.movements
		.filter((mov) => mov < 0)
		.reduce((acc, curr) => acc + curr, 0);
	labelSumOut.textContent = `${Math.abs(out)}???`;

	const interest = account.movements
		.filter((mov) => mov > 0)
		.map((deposit) => (deposit * account.interestRate) / 100)
		.filter((int, i, arr) => {
			return int >= 1;
		})
		.reduce((acc, curr) => acc + curr, 0);

	labelSumInterest.textContent = `${interest}???`;
};

//creating usernames for all users
const createUsernames = function (accs) {
	accs.forEach(function (acc) {
		acc.username = acc.owner
			.toLowerCase()
			.split(' ')
			.map((name) => name[0])
			.join('');
	});
};

createUsernames(accounts);

const eurToUsd = 1.1;

const totalDepositsInUsd = movements
	.filter((mov) => mov > 0)
	.map((mov) => mov * eurToUsd)
	.reduce((acc, curr) => acc + curr, 0);

//

const firstWithdrawal = movements.find((mov) => mov > 0);

const updateUI = function (account) {
	displayMovements(currentAccount);
	calcPrintBalans(currentAccount);
	calcDisplaySummary(currentAccount);
	displayDate();
};

let currentAccount;
let timer;
//display current date
function displayDate() {
	const currentDate = new Date();
	const day = `${currentDate.getDate()}`.padStart(2, 0);
	const month = `${currentDate.getMonth() + 1}`.padStart(2, 0);
	const year = currentDate.getFullYear();
	const hour = `${currentDate.getHours()}`.padStart(2, 0);
	const min = `${currentDate.getMinutes()}`.padStart(2, 0);
	labelDate.textContent = `${day}/${month}/${year}, ${hour}:${min}`;
}

//Login
btnLogin.addEventListener('click', function (e) {
	//prevent Reload
	e.preventDefault();

	currentAccount = accounts.find(
		(acc) => acc.username === inputLoginUsername.value
	);

	if (currentAccount?.pin === Number(inputLoginPin.value)) {
		labelWelcome.textContent = `Dobro do??li, ${
			currentAccount.owner.split(' ')[0]
		}`;
		containerApp.style.opacity = 100;

		if (timer) clearInterval(timer);
		timer = startLogoutTimer();

		updateUI(currentAccount);
		inputLoginUsername.value = '';
		inputLoginPin.value = '';
	} else {
		alert('Pogresni podaci!');
	}
});

//transfer of money
btnTransfer.addEventListener('click', function (e) {
	e.preventDefault();
	const amount = Number(inputTransferAmount.value);
	const receiverAccount = accounts.find(
		(acc) => acc.username === inputTransferTo.value
	);

	if (
		amount > 0 &&
		receiverAccount &&
		currentAccount.balance >= amount &&
		receiverAccount?.username !== currentAccount.username
	) {
		currentAccount.movements.push(-amount);
		receiverAccount.movements.push(amount);

		currentAccount.movementsDates.push(new Date().toISOString());
		receiverAccount.movementsDates.push(new Date().toISOString());

		inputTransferAmount.value = '';
		inputTransferTo.value = '';

		updateUI(currentAccount);
		clearInterval(timer);
		timer = startLogoutTimer();
	} else {
		alert(
			'Greska,proverite podatke o primaocu ili kolicinu novca koju saljete!'
		);
	}
});
const startLogoutTimer = function () {
	let time = 300;
	const tick = function () {
		const min = String(Math.trunc(time / 60)).padStart(2, 0);
		const sec = String(time % 60).padStart(2, 0);
		labelTimer.textContent = `${min}:${sec}`;

		if (time === 0) {
			clearInterval(timer);
			containerApp.style.opacity = 0;
			labelWelcome.textContent = 'Prijavite se za pocetak';
		}
		time--;
	};
	tick();
	const timer = setInterval(tick, 1000);
	return timer;
};

//loan
btnLoan.addEventListener('click', function (e) {
	e.preventDefault();
	const amount = Number(inputLoanAmount.value);

	if (
		amount > 0 &&
		currentAccount.movements.some((mov) => mov >= amount * 0.1)
	) {
		setTimeout(function () {
			currentAccount.movements.push(amount);
			currentAccount.movementsDates.push(new Date().toISOString());

			inputLoanAmount.value = '';

			updateUI(currentAccount);
			clearInterval(timer);
			timer = startLogoutTimer();
		}, 2500);
	} else {
		alert('Proverite kolicinu i da li zadovoljavate uslove kredita!');
	}
});

//close account
btnClose.addEventListener('click', function (e) {
	e.preventDefault();

	if (
		currentAccount.username === inputCloseUsername.value &&
		currentAccount.pin === Number(inputClosePin.value)
	) {
		const index = accounts.findIndex(
			(acc) => acc.username === currentAccount.username
		);
		accounts.splice(index, 1);
		containerApp.style.opacity = 0;
		labelWelcome.textContent = 'Prijavite se za po??etak';
	}
});

let sorted = false;

btnSort.addEventListener('click', function (e) {
	e.preventDefault();
	displayMovements(currentAccount.movements, !sorted);
	sorted = !sorted;
});
