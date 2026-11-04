// v16.16: elige vista. "Solo lista" no descarga Three.js (import dinámico).
const ab=new URLSearchParams(location.search).get('abrir');
if(ab==='lista')localStorage.setItem('oficinaVista','lista');else if(ab==='3d')localStorage.setItem('oficinaVista','3d');
if(localStorage.getItem('oficinaVista')==='lista')import('./lista.js');else import('./main.js');
