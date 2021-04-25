import React from 'react'
import {withRouter} from 'react-router-dom'

//JS
import axios from 'axios'
import $ from 'jquery'
//css
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap/dist/css/bootstrap-grid.css'
import "../css/componentListaAsistencia.css"
//componentes
import ComponentDashboard from './componentDashboard'
//sub componentes
import InputButton from '../subComponentes/input_button'
import AlertBootstrap from "../subComponentes/alertBootstrap"

class ComponentListaAsistencia extends React.Component{

    constructor(){
        super()
        this.mostrarModulo=this.mostrarModulo.bind(this);
        this.pasarAsistencia=this.pasarAsistencia.bind(this);
        this.mostrarModalObservacion=this.mostrarModalObservacion.bind(this);
        this.cambiarEstado=this.cambiarEstado.bind(this);
        this.enviarObservacion=this.enviarObservacion.bind(this);
        this.state={
            modulo:"",// modulo menu
            estado_menu:false,
            //----------
            hashAsistencia:{},
            id_asistencia:null,
            observacion_asistencia:"",
            asistencias:[],
            alerta:{
                color:null,
                mensaje:null,
                estado:false
            }
        }
    }

    mostrarModulo(a){// esta funcion tiene la logica del menu no tocar si no quieres que el menu no te responda como es devido
        var span=a.target;
        if(this.state.modulo===""){
            const estado="true-"+span.id;
            this.setState({modulo:estado,estado_menu:true});
        }
        else{
            var modulo=this.state.modulo.split("-");
            if(modulo[1]===span.id){
                if(this.state.estado_menu){
                    const estado="false-"+span.id
                    this.setState({modulo:estado,estado_menu:false})
                }
                else{
                    const estado="true-"+span.id
                    this.setState({modulo:estado,estado_menu:true})
                }
            }
            else{
                if(this.state.estado_menu){
                    const estado="true-"+span.id
                    this.setState({modulo:estado})
                }
                else{
                    const estado="true-"+span.id
                    this.setState({modulo:estado,estado_menu:true})
                }
            }
        }

        
    }

    async componentWillMount(){
        await this.consultarAsistencia()
    }

    async consultarAsistencia(){
        await axios.get(`http://localhost:8080/transaccion/asistencia/consultar-asistencia-hoy`)
        .then(repuesta => {
            let json=JSON.parse(JSON.stringify(repuesta.data))
            console.log(json)
            
            let hash={}
            for(let asistencia of json.asistencias){
                hash[asistencia.id_asistencia]=asistencia
            }
            // console.log(hash)
            this.setState({asistencias:json.asistencias,hashAsistencia:hash})

        })
        .catch(error => {
            console.log("error al conectar con el servidor")
        })
    }
    
    async pasarAsistencia(){
        await axios.get(`http://localhost:8080/transaccion/asistencia/verificar-inasistencias-justificada`)
        await axios.get(`http://localhost:8080/transaccion/asistencia/verificar-inasistencias-injustificada`)
        window.location.href = window.location.href;
    }

    mostrarModalObservacion(fila){
        let idAsistencia=fila.target.getAttribute("data-id-asistencia")
        this.setState({id_asistencia:idAsistencia})
        $("#modalObservacion").modal("show")
        let asistencias=JSON.parse(JSON.stringify(this.state.hashAsistencia))
        let asistencia=asistencias[idAsistencia]
        console.log(asistencia)
        this.setState({observacion_asistencia:(asistencia.observacion_asistencia===null)?"":asistencia.observacion_asistencia})
    }

    async enviarObservacion(){
        let  alerta={
            color:null,
            mensaje:null,
            estado:false
        }
        let $inputObservacion=document.getElementById("observacion_asistencia")
        let token=localStorage.getItem("usuario")
        const datos={
            asistencia:{
                id_asistencia:this.state.id_asistencia,
                observacion_asistencia:$inputObservacion.value,
                token
            }
        }
        console.log("datos =>>>> ",datos)
        await axios.put(`http://localhost:8080/transaccion/asistencia/agregar-observacion`,datos)
        .then(async respuesta => {
            let json=JSON.parse(JSON.stringify(respuesta.data))
            console.log("repuesta servidor =>>> ",json)
            $("#modalObservacion").modal("hide")
            if(json.estado_peticion==="200"){
                alerta.mensaje=json.mensaje
                alerta.color="success"
                alerta.estado=true
            }
            else{
                
                alerta.mensaje=json.mensaje
                alerta.color="danger"
            }
            this.setState({alerta,observacion_asistencia:""})
            await this.consultarAsistencia()
        })
        .catch(error => { 
            console.log("error  al conectarse con el servidor")
            alerta.mensaje="error al conectarse con el servidor"
            alerta.color="danger"
            alerta.estado=true
            this.setState({alerta})
        })
    }

    cambiarEstado(a){
        let input = a.target
        this.setState({[input.name]:input.value})
    }

    render(){

        const component=(
            <div className="row justify-content-center">
                {this.state.alerta.estado===true &&
                    (<div className="col-12 col-ms-12 col-md-12 col-lg-12 col-xl-12">

                        <AlertBootstrap colorAlert={this.state.alerta.color} mensaje={this.state.alerta.mensaje}/>
                        
                    </div>)
                }
                <div className="col-12 col-ms-12 col-md-12 col-lg-12 col-xl-12 contenedor_formulario_cam">
                    <div className="row justify-content-center mb-3">
                        <div className="col-12 col-ms-12 col-md-12 col-lg-12 col-xl-12 text-center contenedor-titulo-form-cam">
                            <span className="titulo-form-cam">Lista de Asistencia</span>
                        </div>
                    </div>

                    <div className="row  mb-3">
                        <div className="col-3 col-ms-3 col-md-3 col-lg-3 col-xl-3">

                            <button class="btn btn-success"  data-toggle="modal" data-target="#exampleModal">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-clipboard-check" viewBox="0 0 16 16">
                                    <path fill-rule="evenodd" d="M10.854 7.146a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 1 1 .708-.708L7.5 9.793l2.646-2.647a.5.5 0 0 1 .708 0z"/>
                                    <path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1v-1z"/>
                                    <path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h3zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3z"/>
                                </svg>
                            </button>

                        </div>

                    </div>

                    <div class="modal fade" id="exampleModal" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
                        <div class="modal-dialog" role="document">
                            <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title" id="exampleModalLabel">Asistencia</h5>
                                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                                </button>
                            </div>
                            <div class="modal-body">
                               <p>Esta seguro de quiere pasar la asistenica</p>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-danger" data-dismiss="modal">No</button>
                                <button type="button" class="btn btn-success" onClick={this.pasarAsistencia}>Si</button>
                            </div>
                            </div>
                        </div>
                    </div>

                    <div class="modal fade" id="modalObservacion" tabindex="-1" role="dialog" aria-labelledby="modalObservacionLabel" aria-hidden="true">
                        <div class="modal-dialog" role="document">
                            <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title" id="modalObservacionLabel">Asistencia</h5>
                                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                                </button>
                            </div>
                            <div class="modal-body">
                               <h3 className="text-center mb-3">Agrege una observación</h3>
                               <textarea className="form-control observacion" id="observacion_asistencia" name="observacion_asistencia" value={this.state.observacion_asistencia} onChange={this.cambiarEstado}></textarea>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-danger" data-dismiss="modal">Cancelar</button>
                                <button type="button" class="btn btn-primary" onClick={this.enviarObservacion}>guardar</button>
                            </div>
                            </div>
                        </div>
                    </div>

                    <table className="table table-bordered table-hover table-dark">
                        <thead>
                            <tr>
                            <th scope="col">Cédula</th>
                            <th scope="col">Nombre trabajador</th>
                            <th scope="col">hora de llegada</th>
                            <th scope="col">Cumplimiento H.</th>
                            <th scope="col">Estado asistencia</th>
                            <th scope="col">Estado trabajador</th>
                            </tr>
                        </thead>
                        <tbody>
                           {this.state.asistencias.map((asistencia,index) => {
                               return(
                                <tr key={index} className="filaTabla" data-id-asistencia={asistencia.id_asistencia} onClick={this.mostrarModalObservacion}>
                                    <td data-id-asistencia={asistencia.id_asistencia} >{asistencia.id_cedula}</td>
                                    <td data-id-asistencia={asistencia.id_asistencia} >{asistencia.nombres} {asistencia.apellidos}</td>
                                    <td data-id-asistencia={asistencia.id_asistencia} >{(asistencia.horario_entrada_asistencia==="--:--AM")?"--:--":asistencia.horario_entrada_asistencia}</td>
                                    <td data-id-asistencia={asistencia.id_asistencia}  className={(asistencia.estatu_cumplimiento_horario==="C")?"bg-success":"bg-danger"}>{(asistencia.estatu_cumplimiento_horario==="C")?"cumplio con el horario":"no cumplio con el horario"}</td>
                                    <td data-id-asistencia={asistencia.id_asistencia}  className={(asistencia.estatu_asistencia==="P")?"bg-success":(asistencia.estatu_asistencia==="II")?"bg-danger":"bg-primary"}>{(asistencia.estatu_asistencia==="P")?"Presente":(asistencia.estatu_asistencia==="II")?"Inasistencia injustificada":(asistencia.estatu_asistencia==="IJP")?"Inasistencia justificada por Permiso":"Inasistencia justificada por Reposo"}</td>
                                    <td data-id-asistencia={asistencia.id_asistencia}  >{(asistencia.horario_entrada_asistencia!="--:--AM" && asistencia.id_permiso_trabajador===null)?"Laborando":(asistencia.horario_entrada_asistencia!="--:--AM" && asistencia.id_permiso_trabajador!==null)?"vino pero se retiro":"-"}</td>
                                </tr>
                               )
                            })
                           }
                        </tbody>
                    </table>

                </div>
            </div>
        )

        return (

            <div className="component_lista_asistencia">
                <ComponentDashboard
                componente={component}
                modulo={this.state.modulo}
                eventoPadreMenu={this.mostrarModulo}
                estado_menu={this.state.estado_menu}
                />
            </div>

        )
    }


}

export default withRouter(ComponentListaAsistencia)