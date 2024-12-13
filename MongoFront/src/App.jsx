// Importamos los módulos necesarios de React
import { useState } from "react";
import { useEffect } from "react";
import { useReducer } from "react";
import React from "react";
import "./App.css";

// Estado inicial para el hook useReducer
const initialState = {
  Component: "",
  Model: "",
  Price: 0,
  Number: 0,
  submited: false,
};

// Función reductora para gestionar cambios en el estado
function reducer(state, action) {
  switch (action.type) {
    case "update_field":
      // Actualiza un campo específico en el estado
      return {
        ...state,
        [action.field]: action.value,
      };
    case "submit":
      // Cambia el estado de "submitted" a true
      return {
        ...state,
        submitted: true,
      };
    case "finishedSubmit":
      // Cambia el estado de "submitted" a false
      return {
        ...state,
        submitted: false,
      };
    default:
      // Lanza un error si la acción no es reconocida
      throw new Error("Acción no reconocida");
  }
}

function App() {
  // Hooks para gestionar estado y acciones
  const [components, setComponnets] = useState([]); // Lista de componentes
  const [models, setModels] = useState([]); // Lista de modelos asociados a un componente
  const [state, dispatch] = useReducer(reducer, initialState); // Estado gestionado con useReducer
  const [add, setAdd] = useState(false); // Estado para mostrar mensaje de adición exitosa
  const [selectedCompoonent, setSelectedComponent] = useState(""); // Componente seleccionado
  const [selectedModel, setSelectedModel] = useState(""); // Modelo seleccionado

  // Manejador de cambios en los campos del formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    dispatch({ type: "update_field", field: name, value });
  };

  // Manejador para el envío del formulario
  function handleSubmit(e) {
    e.preventDefault();
    setAdd(false);
    const { submited, ...component } = state; // Excluye el campo "submitted"
    dispatch({ type: "submit" }); // Indica que se ha enviado el formulario

    // Realiza una solicitud POST para registrar un nuevo componente
    fetch("http://192.168.100.220:3000/crearComponente", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(component),
    })
      .then((res) => res.json())
      .then((res) => {
        console.log(res.message);
        if (res.message === "El componente se ha registrado") {
          // Actualiza la lista de componentes y resetea el estado
          setComponnets((components) => [...components, { _id: state.Component }]);
          setAdd(true);
          dispatch({ type: "finishedSubmit" });
        }
      })
      .catch((error) => {
        console.error("Hubo un problema con la solicitud:", error);
      });
  }

  // Maneja la selección de un componente
  function handleSelectComponents(e) {
    setSelectedComponent(e.target.innerText); // Guarda el componente seleccionado

    // Realiza una solicitud GET para obtener los modelos asociados al componente
    fetch(`http://192.168.100.220:3000/componente/${e.target.innerText}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error("Codigo de error");
        }
        return res.json();
      })
      .then((res) => {
        console.log(res);
        setModels(res); // Actualiza la lista de modelos
      })
      .catch((error) => {
        console.error("Hubo un problema con la solicitud:", error);
      });
  }

  // Maneja la selección de un modelo
  function handleModel(model) {
    setSelectedModel(model.Modelo); // Guarda el modelo seleccionado
  }

  // Maneja la eliminación de un componente y su modelo asociado
  function handleDelete() {
    fetch(`http://192.168.100.220:3000/borrarComponente/${selectedCompoonent}_${selectedModel}`, {
      method: "DELETE",
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Codigo de error");
        }
        return res.json();
      })
      .then(() => {
        // Actualiza la lista de componentes y modelos tras la eliminación
        fetch(`http://192.168.100.220:3000/componentes`)
          .then((res) => res.json())
          .then((res) => setComponnets(res))
          .catch((error) => console.error("Error al actualizar componentes:", error));

        fetch(`http://192.168.100.220:3000/componente/${selectedCompoonent}`)
          .then((res) => res.json())
          .then((res) => setModels(res))
          .catch((error) => console.error("Error al actualizar modelos:", error));
      })
      .catch((error) => {
        console.error("Hubo un problema con la solicitud:", error);
      });
  }

  // Carga inicial de componentes al montar el componente React
  useEffect(() => {
    fetch(`http://192.168.100.220:3000/componentes`)
      .then((res) => {
        if (!res.ok) {
          throw new Error("Codigo de error");
        }
        return res.json();
      })
      .then((res) => {
        console.log(res);
        setComponnets(res); // Guarda los componentes obtenidos
      })
      .catch((error) => {
        console.error("Hubo un problema con la solicitud:", error);
      });
  }, [setComponnets]);

  // Renderiza el contenido de la aplicación
  return (
    <>
      <div className="container">
        <p className="title">Componentes disponibles</p>
        <div className="componentContainer">
        {components.map((component, index) => {
          return (
            <div className="component" onClick={handleSelectComponents} style={selectedCompoonent === component["_id"] ? {backgroundColor : "red"} : {}} key={index}>
              {component["_id"]}
            </div>
          );
        })}
        </div>
        <br className="line" />
        <p className="title">
          Seleccione el componente que desea para visualizar los modelos
          disponibles
        </p>
        <div className="componentContainer">
        {models.map((model, index) => {
          return (
            <div onClick={() => handleModel(model)} style={selectedModel === model.Modelo ? {backgroundColor : "red"} : {}} className = "model" key={index}>
              <p>Modelo: {model.Modelo}</p>
              <p>Precio: ${model.Costo}</p>
              <p>Numero de piezas: {model.Piezas}</p>
            </div>
          );
        })}
        </div>
        <br className="line" />
        <p className="title">Agregar un componente</p>
        <form className="form" onSubmit={handleSubmit}>
          <div className="field">
            <label>
              Componente:
              <input
                type="text"
                name="Component"
                value={state.Component}
                onChange={handleChange}
              />
            </label>
          </div>
          <div className="field">
            <label>
              Model:
              <input
                type="text"
                name="Model"
                value={state.Model}
                onChange={handleChange}
              />
            </label>
          </div>
          <div className="field">
            <label>
              Price $:
              <input
                type="number"
                name="Price"
                value={state.Price}
                onChange={handleChange}
              />
            </label>
          </div>
          <div className="field">
            <label>
              Numero de componentes:
              <input
                type="number"
                name="Number"
                value={state.Number}
                onChange={handleChange}
              />
            </label>
          </div>
          <button type="submit">Enviar</button>
        </form>
        {state.submitted && (
          <div>
            <h3 className="message">Datos enviados:</h3>
          </div>
        )}
        {add && (
          <div>
            <h3 className="message">Se ha insertado el componente.</h3>
          </div>
        )}
        <p className="title">Borrar componente: Da click al boton de abajo si desea borrar el componente</p>
        <button onClick={handleDelete}>Borrar</button>
      </div>
    </>
  );
}

export default App;
