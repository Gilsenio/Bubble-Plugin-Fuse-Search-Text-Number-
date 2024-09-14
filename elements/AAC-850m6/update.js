function(instance, properties, context) {
  $(document).ready(function() {
  //  console.log("Iniciando a função de busca");

    try {
      // Verificação da data source
      if (!properties.data_source || typeof properties.data_source.length !== 'function') {
       // console.log("Data source inválida ou não inicializada");
        instance.publishState('result', []);
        instance.publishState('count', 0);
        return;
      }

      var source_length = properties.data_source.length();
      if (source_length === 0) {
       //console.log("Data source vazia");
        instance.publishState('result', []);
        instance.publishState('count', 0);
        return;
      }

      var data_source = properties.data_source.get(0, source_length);
      //console.log("Data source length:", source_length);
      //console.log("Primeiro item da data source:", data_source[0]);

      var keys = [];
      var list = [];
      var keywords = [];
      var new_source = [];
      var isObjectDataSource = typeof data_source[0] === 'object' && data_source[0] !== null && !Array.isArray(data_source[0]);

      //console.log("É uma data source de objetos?", isObjectDataSource);

      function addKeyword(value) {
        if (value != null && value !== "Empty" && keywords.indexOf(String(value)) === -1) {
          keywords.push(String(value));
        }
      }

      function formatValue(value) {
        return value != null ? String(value) : "";
      }

      if (properties.input != null && properties.input.trim() !== "") {
        //console.log("Input de busca:", properties.input);

        if (isObjectDataSource) {
          if (properties.field_1) {
            for (var i = 1; i <= 10; i++) {
              var fieldName = 'field_' + i;
              if (properties[fieldName]) {
                keys.push(properties[fieldName]);
                //console.log(`Campo adicionado: ${fieldName}, Valor: ${properties[fieldName]}`);
              }
            }
          } else {
            var firstObject = data_source[0];
            keys = firstObject.listProperties ? firstObject.listProperties() : Object.keys(firstObject);
          }

          if (keys.length === 0) {
            //console.log("Nenhum campo válido para busca");
            instance.publishState('result', []);
            instance.publishState('count', 0);
            return;
          }

          //console.log("Campos para busca:", keys);

          for (var i = 0; i < source_length; i++) {
            var object = data_source[i];
            var item = { index: i };
            keys.forEach(key => {
              item[key] = formatValue(object.get ? object.get(key) : object[key]);
            });
            list.push(item);
          }
        } else {
          keys = ['value'];
          for (var i = 0; i < source_length; i++) {
            list.push({
              index: i,
              value: formatValue(data_source[i])
            });
          }
        }

        //console.log("Lista preparada para busca:", list.slice(0, 3));

        const options = {
          isCaseSensitive: properties.isCaseSensitive || false,
          findAllMatches: properties.findAllMatches || false,
          includeScore: properties.includeScore || false,
          includeMatches: properties.includeMatches || false,
          minMatchCharLength: properties.minMatchCharLength || 1,
          location: properties.location || 0,
          threshold: properties.threshold || 0.3,
          distance: properties.distance || 100,
          ignoreLocation: properties.ignoreLocation || false,
          keys: keys
        };

        //console.log("Opções de busca:", options);

        const fuse = new Fuse(list, options);
        var result = fuse.search(String(properties.input.trim()));
        //console.log("Resultados da busca:", result);

        instance.publishState('count', result.length);

        for (var i = 0; i < result.length; i++) {
          new_source.push(data_source[result[i].item.index]);
          if (properties.input_id != null) {
            keys.forEach(key => {
              if (result[i].item[key] !== undefined) {
                addKeyword(result[i].item[key]);
              }
            });
          }
        }

        instance.publishState('result', new_source);
        //console.log("Novos resultados publicados:", new_source);

        if (properties.input_id != null) {
          var datalist = document.getElementById(properties.input_id + '-datalist');
          if (!datalist) {
            datalist = document.createElement('datalist');
            datalist.id = properties.input_id + '-datalist';
            document.body.appendChild(datalist);
          }
          
          datalist.innerHTML = '';
          keywords.forEach(function(keyword) {
            var option = document.createElement('option');
            option.value = keyword;
            datalist.appendChild(option);
          });

          var input = document.getElementById(properties.input_id);
          if (input) {
            input.setAttribute('list', datalist.id);
          }
        }
      } else {
        instance.publishState('result', data_source);
        instance.publishState('count', source_length);
      }
    } catch (error) {
      //console.error("Erro na função de busca:", error);
      instance.publishState('result', []);
      instance.publishState('count', 0);
    }
  });
}
