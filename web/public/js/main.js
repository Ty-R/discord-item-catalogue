window.onload = () => {
  $('.search-focus a').click(function () {
    const flag = $(this).attr('data-focus');
    $('#flag').val(flag)
    $('.main-search').attr('placeholder', `Search catalogue by ${flag}..`);
  })
};