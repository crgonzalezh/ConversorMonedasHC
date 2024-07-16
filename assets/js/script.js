let data = {};

async function getData() {
    try {
        const res = await fetch('https://mindicador.cl/api/');
        if (!res.ok) {
            throw new Error('Error en la consulta de la API');
        }
        data = await res.json();
    } catch (error) {
        console.error('Error al obtener datos de la API:', error);
        try {
            const res = await fetch('./assets/json/mindicador.json');
            if (!res.ok) {
                throw new Error('Error en la consulta del archivo local');
            }
            data = await res.json();
        } catch (localError) {
            document.getElementById('resultado').textContent = `Error: ${localError.message}`;
        }
    }
}

const transformValue = async function () {
    const valor = document.querySelector('#valor').value;
    const moneda = document.querySelector('#moneda').value;
    const tasaCambio = data[moneda].valor;
    const valorConvertido = valor / tasaCambio;
    document.querySelector('#resultado').textContent = `Resultado: ${valorConvertido.toFixed(2)}`;
    
    await graficar(moneda);
}

async function obtenerHistorial(moneda) {
    const historial = [];
    let contador = 0;
    let i = 0;

    while (contador < 10) {
        const fecha = new Date();
        fecha.setDate(fecha.getDate() - i);
        const fechaStr = fecha.toISOString().split('T')[0].split('-').reverse().join('-');

        try {
            const respuesta = await fetch(`https://mindicador.cl/api/${moneda}/${fechaStr}`);
            if (respuesta.ok) {
                const datos = await respuesta.json();
                if (datos.serie && datos.serie.length > 0) {
                    historial.push({ fecha: fechaStr, valor: datos.serie[0].valor });
                    contador++;
                }
            }
        } catch (error) {
            console.error('Error al obtener el historial:', error);
        }

        i++;
    }

    return historial.reverse();
}

async function graficar(moneda) {
    const historial = await obtenerHistorial(moneda);
    const fechas = historial.map(item => item.fecha);
    const valores = historial.map(item => item.valor);

    Highcharts.chart('grafico', {
        title: { text: 'Historial últimos 10 días' },
        xAxis: { categories: fechas },
        yAxis: { title: { text: `Valor en ${moneda}` } },
        series: [{
            name: moneda,
            data: valores
        }]
    });
}

// Inicializar datos al cargar la página
getData();


getData();
