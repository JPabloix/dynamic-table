(function( $ ) {
    var dataTable  = {};

    $.fn.dynamicTable = function(data, options)
    {
        var settings = getSettings(options);
        var el       = this;
        var id       = el.attr("id");
        el.empty();
        el.append("<table id='dataTable"+id+"' class='"+settings.classTable+"'></table>");

        generateDataTable(data, 'dataTable'+id, settings)
        return el;
    };

    var getSettings = function(options)
    {
        var defaults = {
            totalName            : 'Total',
            fullTotalName        : 'Total General',
            classTable           : 'table table-hover table-bordered table-condensed',
            classRowFullTotal    : 'row-full-total',
            classRowTotal        : 'row-total',
            classColumnFullTotal : 'row-full-total',
            classTr              : '',
            elementExpand        : '<div class ="cross" aria-hidden="true"></div>',
            elementContract      : '<div class ="minus" aria-hidden="true"></div>'
        };

        return $.extend( {}, defaults, options );
    };


    var generateDataTable = function(data, id, settings)
    {
        table                             = $("#"+id);
        dataTable[id]                     = jQuery.extend(true, {}, data);
        dataTable[id].settings            = settings;
        dataTable[id].cabecerasExpandidas = [];
        dataTable[id].filasExpandidas     = [];

        dataTable[id].cabecerasShow       = getInitialShow(dataTable[id].cabeceras, dataTable[id].dimensiones.cabeceras.length);
        dataTable[id].filasShow           = getInitialShow(dataTable[id].filas, dataTable[id].dimensiones.filas.length);
        table.empty();
        drawTable(id, table);
    }


    var getInitialShow = function (data, niveles)
    {

      var valores = [];
      if (niveles == 1 || niveles == 0) {
        valores = $.map(data, function(value, key) {
          return key;
        });
      } else
      {
        $.each(data, function(key, valor) {
          if (valor[1] == "*")
          {
            valores.push(parseInt(key));
          }
        });
      }
      return valores;
    }



    var drawTable = function(div_id, tabla_jquery)
    {

        var html = '<thead>';
        var cabecera = generaCabeceras(dataTable,div_id);
        var filas    = generaFilas(dataTable,div_id);

        html += cabecera;
        html += '</thead></tbody>';
        html += filas;
        html += '</tbody>';

        $("#" + div_id).empty();
        $("#" + div_id).append(html);

        $('#'+div_id+' tr').each(function(){
          $(this).find("td").last().addClass(dataTable[div_id].settings.classColumnFullTotal);
        });
        $('#'+div_id+' tr').first().find("th").last().addClass(dataTable[div_id].settings.classColumnFullTotal);

        $('.expandirFila'+div_id).on('click', function() {
            var boton = $(this);
            tabla_jquery = $(this).closest("table");
            expandirFila(boton.data( "indexFila" ),div_id,tabla_jquery);
        });
        $('.contraerFila'+div_id).on('click', function() {
            var boton = $(this);
            tabla_jquery = $(this).closest("table");
            contraerFila(boton.data( "indexFila" ),div_id,tabla_jquery);
        });
        $('.expandirCabecera'+div_id).on('click', function() {
            var boton = $(this);
            tabla_jquery = $(this).closest("table");
            expandirCabecera(boton.data( "indexCabecera" ),div_id,tabla_jquery);
        });
        $('.contraerCabecera'+div_id).on('click', function() {
            var boton = $(this);
            tabla_jquery = $(this).closest("table");
            contraerCabecera(boton.data( "indexCabecera" ),div_id,tabla_jquery);
        });
    }



    var generaCabeceras = function(datos, div_id)
    {

      var cabeceras = '';
      var nombre    = '';
      var colspan   = 1;
      var rowspan   = 1;
      var indice    = -1;
      var max_row   = datos[div_id].dimensiones.cabeceras.length == 0 ? 1 : datos[div_id].dimensiones.cabeceras.length;

      for (var i = 0; i < max_row; i++)
      {
        cabeceraAnterior = [];
        cabeceras += '<tr>';
        $.each(datos[div_id].cabecerasShow, function(key, index)
        {
          cabecera = datos[div_id].cabeceras[index];
          if (nombre == cabecera[i] && nombre != '*')
          {
            rowspan  = getRowSpan(cabecera, max_row, i);
            colspan += 1;
            indice   = index;
          } else
          {
            nombre     = nombre == '' && i > 0 ? '*' : nombre;
            rowspan    = nombre == '' ? max_row : getRowSpan(cabeceraAnterior, max_row, i);
            var boton  = nombre;
            if (i + 1 < max_row && nombre != '')
            {
                boton    = '<div class="expandirCabecera'+div_id+'" data-index-cabecera="'+indice+'">'+datos[div_id].settings.elementExpand+'&nbsp;'+nombre+'</div>';
            }
            cabeceras += nombre == '*' ? '' : '<th nowrap colspan="'+colspan+'" rowspan="'+rowspan+'">'+boton+'</th>';
            nombre     = cabecera[i];
            colspan    = 1;
            rowspan    = 1;
            indice     = index;
          }

          if (rowspan > 1)
          {
            boton      = '<div class="contraerCabecera'+div_id+'" data-index-cabecera="'+indice+'">'+datos[div_id].settings.elementContract+'&nbsp;'+nombre+'</div>';
            colspan   -= 1;
            cabeceras += '<th nowrap colspan="'+colspan+'">'+boton+'</th>';
            cabeceras += '<th nowrap rowspan="'+rowspan+'" class="totalColumn">'+datos[div_id].settings.totalName+' '+nombre+'</th>';
            nombre     = '*';
            colspan    = 1;
            rowspan    = 1;
          }
          cabeceraAnterior = cabecera;
        });


        if (i == 0)
        {
          cabeceras += '<th rowspan="'+max_row+'">'+datos[div_id].settings.fullTotalName+'</th>';
        }
        nombre     = '';
        colspan    = 1;

        cabeceras += '</tr>';
      }

      return cabeceras;
    }

    var getRowSpan = function(cabecera, max_row, row)
    {
        rowSpan = 1;
        if (row < max_row)
        {
          if (cabecera[row + 1] == '*')
          {
            for (var i = row + 1; i < max_row; i++)
            {
              if (cabecera[i] == '*')
              {
                rowSpan += 1;
              } else
              {
                return rowSpan;
              }
            }
          }
        }
        return rowSpan;
    }

    var generaFilas = function(datos,div_id)
    {
      row = '';
      $.each(datos[div_id].filasShow, function(key, indexFila)
      {
        row += '<tr class="'+datos[div_id].settings.classTr+'">';
        var fila = datos[div_id].filas[indexFila];
        var nombre_fila = getNombreFila(fila, indexFila, datos[div_id].filasExpandidas, div_id, datos);

        if(datos[div_id].filasExpandidas.indexOf(indexFila) == -1)
        {
          if(nombre_fila == datos[div_id].settings.fullTotalName)
          {
            row += '<td nowrap class="'+datos[div_id].settings.classRowFullTotal+'">'+nombre_fila+'</td>';
          }else{
            row += '<td nowrap><b>'+nombre_fila+'</b></td>';
          }

        }else{
          row += '<td nowrap class="'+datos[div_id].settings.classRowTotal+'"><b>'+nombre_fila+'</b></td>';
        }


        $.each(datos[div_id].cabecerasShow, function(key, indexColumna)
        {
          var valor = '';
          if (typeof datos[div_id].tabla[indexFila] != 'undefined')
          {
            if (typeof datos[div_id].tabla[indexFila][indexColumna] != 'undefined')
            {
              valor = datos[div_id].tabla[indexFila][indexColumna];
            }
          }

          var valor_string = addComas(valor);

          if(datos[div_id].filasExpandidas.indexOf(indexFila) == -1)
          {
            if(nombre_fila == datos[div_id].settings.fullTotalName)
            {
              row += '<td class="'+datos[div_id].settings.classRowFullTotal+'">'+valor_string+'</td>';
            }else{
              row += '<td>'+valor_string+'</td>';
            }

          }else{
            row += '<td class="'+datos[div_id].settings.classRowTotal+'">'+valor_string+'</td>';
          }
        });

        row += '</tr>';
      });

      return row;
    }



    var getNombreFila = function(fila, indexFila, expandidas, div_id, datos)
    {
      var nombre = datos[div_id].settings.fullTotalName;
      var tab    = -1;

      $.each(fila, function(key, value) {
        if (value != '*') {
          nombre = value;
          tab += 1;
        }
      });

      tab = tab == -1 ? 0 : tab;

      boton = nombre;

      if (tab < fila.length - 1 && nombre != datos[div_id].settings.fullTotalName)
      {
        if (expandidas.indexOf(parseInt(indexFila)) == -1) {
          boton = '<div class="expandirFila'+div_id+'"  data-index-fila="'+indexFila+'">'+datos[div_id].settings.elementExpand+''+nombre+'&nbsp;</div>';
        } else {
          boton = '<div class="contraerFila'+div_id+'"  data-index-fila="'+indexFila+'">'+datos[div_id].settings.elementContract+''+nombre+'&nbsp;</div>';
        }
      }

      var tabs = '';
      for (var i = 0; i < tab; i++)
      {
        tabs += '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;';
      }


      return tabs + boton;
    }

    var addComas = function (nStr)
    {
        nStr += '';
        x = nStr.split('.');
        x1 = x[0];
        x2 = x.length > 1 ? '.' + x[1] : '';
        var rgx = /(\d+)(\d{3})/;
        while (rgx.test(x1)) {
          x1 = x1.replace(rgx, '$1' + ',' + '$2');
        }
        return x1 + x2;
    }


    var mismaAscendencia = function(elementos1, elementos2)
    {
      var iguales = true;
      $.each(elementos1, function(key, value) {
        if (elementos2[key] != value) {
          iguales = false;
        }
      });
      return iguales;
    }

    var mostrarElemento = function(elementos1, elementos2)
    {
      if (mismaAscendencia(elementos1, elementos2))
      {
        if (elementos1.length + 1 == elementos2.length) {
          return true;
        } else if (elementos2[elementos1.length + 1] == '*') {
          return true;
        }
      }

      return false;
    }

    var expandir = function(data, index, seleccionados)
    {
      nombres = [];
      nivel  = 0;
      elemento = data[index];

      $.each(elemento, function(key, value) {
        if (value != '*') {
          nombres.push(value);
          nivel += 1;
        }
      });

      $.each(data, function(key, value)
      {
        if (mostrarElemento(nombres, value)  && index != key)
        {
          if (seleccionados.indexOf(parseInt(key)) == -1)
          {
            seleccionados.push(parseInt(key));
          }
        }

      });

      seleccionados.sort(function(a, b){return a-b});

      return seleccionados;
    }

    var expandirCabecera = function(indexCabecera,div_id,tabla_jquery)
    {
      dataTable[div_id].cabecerasShow = expandir(dataTable[div_id].cabeceras, indexCabecera, dataTable[div_id].cabecerasShow);
      drawTable(div_id,tabla_jquery);
    }

    var expandirFila = function (indexFila,div_id,tabla_jquery)
    {
      dataTable[div_id].filasShow = expandir(dataTable[div_id].filas, indexFila, dataTable[div_id].filasShow);
      dataTable[div_id].filasExpandidas.push(parseInt(indexFila));
      drawTable(div_id,tabla_jquery);
    }

    var contraer = function(data, index, seleccionados, fila,div_id)
    {
      var nombres = [];
      var nivel  = 0;
      var elemento = data[index];
      var indexEliminados = [];

      $.each(elemento, function(key, value) {
        if (value != '*') {
          nombres.push(value);
          nivel += 1;
        }
      });

      $.each(data, function(key, value)
      {
        if (index != key && mostrarElemento(nombres, value))
        {
          var indice = seleccionados.indexOf(parseInt(key));
          if (indice > -1)
          {
            indexEliminados.push(key);
            seleccionados.splice(indice, 1);
          }
        }
      });

      seleccionados.sort(function(a, b){return a-b});

      $.each(indexEliminados, function(key, value)
      {
        if (fila) {
          seleccionados = contraerFilaAnidadas(value,div_id);
        } else {
          seleccionados = contraer(data, value, seleccionados,null,div_id);
        }
      });

      return seleccionados;
    }

    var contraerCabecera = function(indexCabecera,div_id,tabla_jquery)
    {
      dataTable[div_id].cabecerasShow = contraer(dataTable[div_id].cabeceras, indexCabecera, dataTable[div_id].cabecerasShow, false,div_id);
      drawTable(div_id,tabla_jquery);
    }

    var contraerFilaAnidadas = function(indexFila,div_id)
    {

      dataTable[div_id].filasShow = contraer(dataTable[div_id].filas, indexFila, dataTable[div_id].filasShow, true,div_id);

      var index = dataTable[div_id].filasExpandidas.indexOf(parseInt(indexFila));
      if (index > -1)
      {
        dataTable[div_id].filasExpandidas.splice(index, 1);
      }
      dataTable[div_id].filasShow.sort(function(a, b){return a-b});
      return dataTable[div_id].filasShow;
    }

    var contraerFila = function(indexFila,div_id,tabla_jquery)
    {
      contraerFilaAnidadas(indexFila,div_id);
      drawTable(div_id,tabla_jquery);
    }


}(jQuery));