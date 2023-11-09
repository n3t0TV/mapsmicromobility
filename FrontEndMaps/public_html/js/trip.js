// console.log("Trip js");
const host = window.location.host
function startTrip () {
  console.log('Starting trip...')

  $.ajax({
    type: 'GET',
    url: '//' + host + '/startTrip',
    data: {

    },
    success: function (result) {
      // isRecovering = false;
      console.log('Success')
      console.log(result)

      // clearInterval(recoveryInterval);
      // window.location.reload(); //Si está prendido reconectar
    },
    error: function () {
      /* document.getElementById("backgroundDiv").innerHTML = '<h3 style="color:white;">Conexión perdida. Reconectando...</h3>'; */
      console.log('Error request...')
      recovery()
    }
  })
}

function endTrip () {
  console.log('Ending trip...')
  $.ajax({
    type: 'GET',
    url: '//' + host + '/endTrip',
    data: {

    },
    success: function (result) {
      // isRecovering = false;
      console.log('Success')
      console.log(result)

      // clearInterval(recoveryInterval);
      // window.location.reload(); //Si está prendido reconectar
    },
    error: function () {
      /* document.getElementById("backgroundDiv").innerHTML = '<h3 style="color:white;">Conexión perdida. Reconectando...</h3>'; */
      console.log('Error request...')
      recovery()
    }
  })
}
