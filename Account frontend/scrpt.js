function showSection(id) {
  document.querySelectorAll('.content-section').forEach(sec => sec.classList.add('hidden'));
  document.getElementById(id).classList.remove('hidden');
}

async function createAccount() {
  const payload = {
    userId: document.getElementById('create-userId').value,
    accountType: document.getElementById('create-type').value,
    initialBalance: parseFloat(document.getElementById('create-balance').value)
  };

  const res = await fetch('/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  alert(await res.text());
}

async function getUserAccounts() {
  const userId = document.getElementById('user-id').value;
  const res = await fetch(`/user/${userId}`);
  const data = await res.json();
  document.getElementById('user-accounts-result').textContent = JSON.stringify(data, null, 2);
}

async function getAccountById() {
  const id = document.getElementById('account-id').value;
  const res = await fetch(`/${id}`);
  const data = await res.json();
  document.getElementById('account-result').textContent = JSON.stringify(data, null, 2);
}

async function updateStatus() {
  const id = document.getElementById('update-id').value;
  const status = document.getElementById('update-status').value;
  const res = await fetch(`/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  });

  alert(await res.text());
}

async function deleteAccount() {
  const id = document.getElementById('delete-id').value;
  const res = await fetch(`/${id}`, { method: 'DELETE' });
  alert(await res.text());
}

async function deposit() {
  const id = document.getElementById('deposit-id').value;
  const amount = parseFloat(document.getElementById('deposit-amount').value);
  const res = await fetch(`/${id}/deposit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount })
  });
  alert(await res.text());
}

async function withdraw() {
  const id = document.getElementById('withdraw-id').value;
  const amount = parseFloat(document.getElementById('withdraw-amount').value);
  const res = await fetch(`/${id}/withdraw`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount })
  });
  alert(await res.text());
}
