let interval = setInterval(dataLayerHijack,1000)

function dataLayerHijack(){

   if(!window.dataLayer || !window.GTMUtils) {return}
   clearInterval(interval);
   
   let dlPushCopy = window.dataLayer.push;
   
    window.dataLayer.push = payload => {
        sendToSheets(payload);
        payload['patchedBy']="ResourceOverride"
        dlPushCopy.apply(dataLayer,arguments)
    }
    
    console.log('DLT - DataLayer Hijacked successfully')
    }

function sendToSheets(payload){
    window.GTMUtils['uniqueDataLayerEvents'] = {};
    let uniqueEvents = GTMUtils['uniqueDataLayerEvents']
      , sheetId = '1A6voZfWjRWjbqSJ5kxUybULgChwYkj33IuBbVlX5FZ0' //ID da planilha. É a string que fica depois do /d na URL da planilha;
      , excludeGtmPushes = true //true caso queira remover os eventos da forma 'gtm.', false caso contrário;
      , excludeDuplicateEvents = true //true caso apenas uma amostra de cada evento for suficiente, false caso contrário;
      , appUrl = 'https://script.google.com/macros/s/AKfycbzzWm19VTnsJTuigz_Lf-eZvA9tKMRUfNpGN2Q5QHgTgUd0U5va-K6c9VXjTGIqUlK4/exec' // Endpoint do Web App implementado
      , eventName = payload.event ? payload.event : 'message push'
      , fetchOptions = {
          method: "POST",
          redirect:"follow",
          mode:"cors",
          headers:{
            "Content-Type":"text/plain",
          },
          body:JSON.stringify(payload)
        }; 
   
   //Não registra eventos nativos do gtm.  
    if(excludeGtmPushes && /gtm\./.test(payload.event) || Object.keys(payload).some(key => /gtm\./.test(key) )) return;
   //Não registra eventos em duplicidade.    
    else if(excludeDuplicateEvents &&  Object.keys(uniqueEvents).some(function(uniqueEvent){return uniqueEvent == payload.event})) return;
    
    uniqueEvents[payload.event]=payload;
  
    fetch(appUrl+'?sheetId='+sheetId, fetchOptions)
    .then(response => response.json())
    .then(data => console.log("DL2Sheets -*- Evento registrado: " + payload.event))
    .catch(err => console.error("Error:" + err));
}


