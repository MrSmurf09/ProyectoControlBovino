// navigationUtils.js
export function setupGoBackButton() {
  const shi = document.getElementById('si')
  if (shi) {
    shi.addEventListener('click', () => {
      window.history.back()
    })
  }
}
