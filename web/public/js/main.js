window.onload = () => {
  $('.search-focus a').click(function () {
    const flag = $(this).attr('data-focus');
    $('#flag').val(flag);
    $('.main-search').attr('placeholder', `Search catalogue by ${flag}...`);
  });

  $('.pag').click(function() {
    changePage($(this).attr('id'));
  });

  $('#add-listing').submit(function (evt) {
    evt.preventDefault();
    const form = $(this);
    $.post(form.attr('action'), form.serialize())
      .done( (e) => $('.alert').text(e) )
      .fail( (xhr, textStatus, errorThrown) => $('.alert').text(xhr.responseText) );
  });
};

function changePage(direction) {
  const urlParams = new URLSearchParams(window.location.search);
  const page = parseInt(urlParams.get('page')) || 0;

  if (direction === 'next') {
    urlParams.set('page', page + 1);
  } else {
    urlParams.set('page', page - 1);
  }
  
  window.location.search = urlParams.toString()
}