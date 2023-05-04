{

    const DOM = {
        table: function () {
                return {
                    element: document.createElement( 'table' ),
                    rows: [],


                    addRow() {
                        this.rows.push([])
                        return this
                    },
                    addCol() {
                        this.rows[this.rows.length-1].push(document.createElement('td'))
                        return this
                    }
                }
            }
    }
}

const DOM = DOM