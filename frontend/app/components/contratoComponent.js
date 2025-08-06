'use client'
import Link from "next/link";

export default function ContratoComponent(props){

    const [contrato, setContrato] = useState(props.contrato ? props.contrato : {
        idContrato: 0,
        idImovel: 0,
        idLocatario: 0,
        idLocador: 0,
        qtdParcelas: 0,
        valorParcela: 0
    });

    return(
        <div>
            <h1>{props ? 'Alterar Contrato' : 'Novo Contrato'}</h1>

            <div>
                <div className="form-group">
                    <label>Imóvel</label>
                    <select className="form-control">
                        <option>Selecione um imovel</option>
                    </select>
                </div>

                <div className="form-group">
                    <label>Locatario</label>
                    <select className="form-control">
                        <option>Selecione um locatario</option>
                    </select>
                </div>

                <div className="form-group">
                    <label>Locador</label>
                    <input type="text" className="form-control" ref={locador} defaultValue={contrato.locador} disabled/>
                </div>

                <div className="form-group">
                    <label>Qtd Parcelas</label>
                    <input type="number" className="form-control" ref={qtdParcelas} defaultValue={contrato.qtdParcelas} disabled/>
                </div>

                <div className="form-group">
                    <label>Valor Parcela</label>
                    <input type="number" className="form-control" ref={valorParcela} defaultValue={contrato.valorParcela} disabled/>
                </div>

                <div className="form-group">
                    <Link href="/admin/contrato">
                        <button className="btn btn-danger">Cancelar</button>
                    </Link>
                    <button className="btn btn-primary">Gravar</button>
                </div>
            </div>
        </div>
    )
}