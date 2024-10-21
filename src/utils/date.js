const datefrCH = new Intl.DateTimeFormat('fr-CH', {dateStyle: 'short', timeStyle: 'short'});

export function shortFrCH(date) {
  const today = new Date();
  const theDate = new Date(date);
  if (today.toDateString() === theDate.toDateString()) {
    return datefrCH.format(theDate).split(' ')[1];
  }
  return datefrCH.format(theDate);
}