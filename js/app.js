let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
let totalPrecio = parseInt(localStorage.getItem('totalPrecio')) || 0;
let productos; 

class Producto {
    constructor(id, nombre, precio, img) {
        this.id = id;
        this.nombre = nombre;
        this.precio = precio;
        this.img = img;

    }
}

function obtenerProductos() {
    return new Promise((resolve, reject) => {
    fetch('../JSON/productos.JSON')
        .then(response => {
        if (!response.ok) {
            throw new Error('Error al cargar la API, comunícate con servicio técnico');
        }
        return response.json();
        })
        .then(data => {
        productos = data;  
        resolve(data);  
        })
        .catch(error => reject(error));
    });
}

function popUp() {
    const popup = document.getElementById('popup');

    document.getElementById('openPopup').addEventListener('click', function () {

        popup.style.display === 'block' ? popup.style.display = 'none' :
            popup.style.display = 'block'; popup.classList.add('fadeInTop');
    });

    document.getElementById('closePopup').addEventListener('click', function () {
        document.getElementById('popup').style.display = 'none';
    });
}

const agregarAlCarrito = (idProducto) => {

    const producto = encontrarProductoPorId(idProducto);

    if (producto) {

        const productoExistente = carrito.find(item => item.id === idProducto);

        if (productoExistente) {

            productoExistente.cantidad++;
        } else {

            carrito.push({
                id: producto.id,
                nombre: producto.nombre,
                precio: producto.precio,
                cantidad: 1
            });
        }

        Toastify({
            text: "Tu Producto se agrego al carrito!",
            duration: 2000,
            newWindow: true,
            close: false,
            gravity: "top",
            position: "right",
            stopOnFocus: true,
            style: {
                background: "linear-gradient(to right, #D16BA5, #E7CD86)",
            },
            onClick: function () { }
        }).showToast();

        actualizarCarritoUI();

        guardarCarritoEnLocalStorage();
    } else {
        console.error("Producto no encontrado");
    }
};

const encontrarProductoPorId = (idProducto) => {
    return productosInstancias.find(producto => producto.id === idProducto);
};

const actualizarCarritoUI = () => {
    const popupContent = document.querySelector('.popup-content');

    popupContent.innerHTML = '';

    if (carrito.length === 0) {
        popupContent.innerHTML = '<p>El carrito está vacío</p>';
    } else {

        totalPrecio = 0;
        carrito.forEach((item, index) => {
            const productoHTML = `
                <div class="carrito-item">
                    <div>
                        <span>${item.nombre}</span>
                        <span><strong>Cantidad:</strong> ${item.cantidad}</span>
                        <button class="btn  " onclick="eliminarDelCarrito(${index})">Eliminar</button>
                    </div>
                </div>
            `;
            popupContent.innerHTML += productoHTML;

            totalPrecio += item.precio * item.cantidad;
        });

        document.getElementById('totalValue').textContent = totalPrecio.toFixed(2);
    }
};

const eliminarDelCarrito = (index) => {
    const producto = carrito[index];
    const precioEliminado = producto.precio;

    if (producto.cantidad > 1) {
        producto.cantidad--;
    } else {
        carrito.splice(index, 1);
    }

    totalPrecio -= precioEliminado;

    localStorage.setItem('totalPrecio', totalPrecio.toString());

    if (totalPrecio === 0) {
        localStorage.removeItem('totalPrecio');
    }

    actualizarCarritoUI();
    guardarCarritoEnLocalStorage();

    document.getElementById('totalValue').textContent = totalPrecio >= 0 ? totalPrecio.toFixed(2) : '0.00';
};

const borrarCarrito = () => {
    carrito = [];

    totalPrecio = 0;

    actualizarCarritoUI();
    guardarCarritoEnLocalStorage();

    localStorage.clear();

    document.getElementById('totalValue').textContent = '0.00';
};

const guardarCarritoEnLocalStorage = () => {
    localStorage.setItem('carrito', JSON.stringify(carrito));
};

async function main() {
    try {
    const productos = await obtenerProductos();
    console.log('Productos obtenidos:', productos);

    productosInstancias = productos.map(({ id, nombre, precio, imagen }) =>
    new Producto(id, nombre, precio, imagen)
    );


    const contenedorProductos = document.getElementById('contenedor-productos');
    productosInstancias.forEach(producto => {
    contenedorProductos.innerHTML += `
        <div class="producto card">
        <img src="${producto.img}" alt="${producto.nombre}" class="card-img-top img-fluid">
        <div class="card-body">
            <h3>${producto.nombre}</h3>
            <p>${'$' + producto.precio.toFixed(2)}</p>
            <button class=" btn btn-light" onclick="agregarAlCarrito(${producto.id})">Agregar al carrito</button>
        </div>
        </div>
    `;
    });

    popUp();  
    actualizarCarritoUI(); 
} catch (error) {
    console.error('Error en la aplicación:', error);
}
}

main();