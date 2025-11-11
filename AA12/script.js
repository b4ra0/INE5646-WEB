// Implementação mínima para AA12
// Uso: cadastro/login via localStorage, Fetch ViaCEP para CEP, Fetch IBGE para UFs/municípios

// Helpers para localStorage
function getUsers(){
  try{ return JSON.parse(localStorage.getItem('aa12_users')||'[]'); }catch(e){return []}
}
function saveUsers(users){ localStorage.setItem('aa12_users', JSON.stringify(users)); }
function setCurrentUser(email){ localStorage.setItem('aa12_current', email); }
function getCurrentUser(){ return localStorage.getItem('aa12_current'); }
function clearCurrentUser(){ localStorage.removeItem('aa12_current'); }

// DOM
const registerSection = document.getElementById('register-section');
const loginSection = document.getElementById('login-section');
const mainSection = document.getElementById('main-section');
const registerForm = document.getElementById('register-form');
const loginForm = document.getElementById('login-form');

const buscarCepBtn = document.getElementById('buscar-cep');
const cepInput = document.getElementById('r-cep');

const ufSelect = document.getElementById('uf-select');
const citySelect = document.getElementById('city-select');

function showSection(section){
  registerSection.classList.add('hidden');
  loginSection.classList.add('hidden');
  mainSection.classList.add('hidden');
  section.classList.remove('hidden');
}

// CEP: Fetch para ViaCEP
async function buscarCep(){
  const cep = cepInput.value.replace(/\D/g,'');
  if(!cep || cep.length !== 8){ alert('Informe um CEP com 8 dígitos sem pontos/traços.'); return; }
  try{
    const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
    if(!res.ok) throw new Error('Erro na requisição ViaCEP');
    const data = await res.json();
    if(data.erro){ alert('CEP não encontrado.'); return; }
    document.getElementById('r-logradouro').value = data.logradouro || '';
    document.getElementById('r-bairro').value = data.bairro || '';
    document.getElementById('r-municipio').value = data.localidade || '';
    document.getElementById('r-uf').value = data.uf || '';
  }catch(e){ console.error(e); alert('Falha ao buscar CEP. Veja o console.'); }
}

buscarCepBtn.addEventListener('click', buscarCep);
cepInput.addEventListener('blur', ()=>{ if(cepInput.value.replace(/\D/g,'').length===8) buscarCep(); });

// Cadastro
registerForm.addEventListener('submit', (ev)=>{
  ev.preventDefault();
  const name = document.getElementById('r-name').value.trim();
  const email = document.getElementById('r-email').value.trim().toLowerCase();
  const password = document.getElementById('r-password').value;
  const cep = document.getElementById('r-cep').value.trim();
  const logradouro = document.getElementById('r-logradouro').value.trim();
  const bairro = document.getElementById('r-bairro').value.trim();
  const municipio = document.getElementById('r-municipio').value.trim();
  const uf = document.getElementById('r-uf').value.trim();

  const users = getUsers();
  if(users.some(u=>u.email===email)){ alert('Já existe um usuário com este email.'); return; }
  const user = {name,email,password,address:{cep,logradouro,bairro,municipio,uf}};
  users.push(user);
  saveUsers(users);
  alert('Cadastro realizado com sucesso! Você será redirecionado para o login.');
  // redirecionar para login
  showSection(loginSection);
  document.getElementById('l-email').value = email;
});

// Navegação entre forms
document.getElementById('goto-login').addEventListener('click', ()=> showSection(loginSection));
document.getElementById('goto-register').addEventListener('click', ()=> showSection(registerSection));

// Login
loginForm.addEventListener('submit', (ev)=>{
  ev.preventDefault();
  const email = document.getElementById('l-email').value.trim().toLowerCase();
  const password = document.getElementById('l-password').value;
  const users = getUsers();
  const found = users.find(u=>u.email===email && u.password===password);
  if(!found){ alert('Credenciais inválidas.'); return; }
  setCurrentUser(email);
  showMain();
});

// Mostrar área principal após login
function showMain(){
  const email = getCurrentUser();
  if(!email){ showSection(loginSection); return; }
  const users = getUsers();
  const user = users.find(u=>u.email===email);
  if(!user){ clearCurrentUser(); showSection(loginSection); return; }
  document.getElementById('user-name').textContent = user.name || user.email;
  showSection(mainSection);
  // carregar UFs se ainda não carregadas
  if(!ufSelect.dataset.loaded) loadUFs();
}

// Logout
document.getElementById('logout').addEventListener('click', ()=>{
  clearCurrentUser(); showSection(loginSection);
});

// IBGE: UFs e municípios
async function loadUFs(){
  try{
    ufSelect.innerHTML = '<option value="">-- selecione uma UF --</option>';
    ufSelect.disabled = false;
    const res = await fetch('https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome');
    if(!res.ok) throw new Error('Erro ao obter UFs');
    const data = await res.json();
    // data já vem ordenado por nome com orderBy=nome; vamos garantir ordenação
    data.sort((a,b)=>a.nome.localeCompare(b.nome,'pt-BR'));
    data.forEach(uf=>{
      const opt = document.createElement('option');
      opt.value = uf.id; // usaremos id para buscar municípios
      opt.textContent = `${uf.sigla} - ${uf.nome}`;
      opt.dataset.sigla = uf.sigla;
      ufSelect.appendChild(opt);
    });
    ufSelect.dataset.loaded = '1';
  }catch(e){ console.error(e); alert('Falha ao carregar UFs.'); }
}

ufSelect.addEventListener('change', async ()=>{
  const ufId = ufSelect.value;
  citySelect.innerHTML = '';
  if(!ufId){ citySelect.disabled = true; citySelect.innerHTML = '<option value="">-- escolha uma UF primeiro --</option>'; return; }
  citySelect.disabled = false;
  citySelect.innerHTML = '<option value="">Carregando municípios...</option>';
  try{
    const res = await fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${ufId}/municipios?orderBy=nome`);
    if(!res.ok) throw new Error('Erro ao obter municípios');
    const data = await res.json();
    data.sort((a,b)=>a.nome.localeCompare(b.nome,'pt-BR'));
    citySelect.innerHTML = '<option value="">-- selecione um município --</option>';
    data.forEach(c=>{
      const opt = document.createElement('option');
      opt.value = c.id;
      opt.textContent = c.nome;
      citySelect.appendChild(opt);
    });
  }catch(e){ console.error(e); citySelect.innerHTML = '<option value="">Erro ao carregar municípios</option>'; }
});

// Inicialização
window.addEventListener('load', ()=>{
  if(getCurrentUser()) showMain();
  else showSection(registerSection);
});
