export interface ArticuloInventario {
	id: number;
	nombre: string;
	sku?: string;
	tipo?: string;
	stockActual: number;
	stockMinimo: number;
	unidad?: string;
	costoUnitario?: number;
	unidadMedida?: string;
	categoria?: string;
	estado?: 'NORMAL' | 'BAJO' | 'ADVERTENCIA';
}
