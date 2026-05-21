describe('Pruebas de Registro en ServiClick', () => {
  it('Debería llenar el formulario de registro correctamente', () => {
    // 1. Visitar la página en el puerto donde está corriendo tu Angular
    cy.visit('http://localhost:61677/register-usuario')

    // 2. Buscar los campos por su tipo o posición y escribir en ellos
    cy.get('input[type="text"]').eq(0).type('camila')
    cy.get('input[type="text"]').eq(1).type('lopez')
    cy.get('input[type="email"]').type('camilop46@gmail.com')
    cy.get('input[type="password"]').type('1234') // Tu contraseña
    cy.get('input[type="tel"]').type('3214567895')

    // 3. Hacer clic en el botón de Registrarse
    cy.get('button').contains('Registrarse').click()

    // 4. Verificar si muestra un mensaje de éxito (o validar el error)
    // cy.contains('Usuario registrado con éxito').should('be.visible')
  })
})
