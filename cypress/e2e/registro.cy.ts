describe('Pruebas de Registro en ServiClick', () => {
  it('Debería llenar el formulario de registro correctamente', () => {
    // 1. Visitar tu página local de registro
    cy.visit('http://localhost:61677/register-usuario')

    // 2. Llenar los datos de Camila
    cy.get('input[type="text"]').eq(0).type('camila')
    cy.get('input[type="text"]').eq(1).type('lopez')
    cy.get('input[type="email"]').type('camilop46@gmail.com')
    cy.get('input[type="password"]').type('1234')
    cy.get('input').eq(4).type('3214567895')

    // 3. Hacer clic en el botón de Registrarse
    cy.get('button').contains('Registrarse').click()
  })
})
