describe('DocFlowEngine Conversion', () => {
  it('successfully converts a PDF to Word', () => {
    cy.visit('/')
    cy.get('input[type=file]').attachFile('test.pdf', { force: true }).trigger('change', { force: true });
    cy.get('[data-testid="selected-file-name"]').should('contain', 'test.pdf')
    cy.get('[data-testid="convert-button"]').click()
    cy.get('button').contains('Download').should('be.visible')
    cy.get('button').contains('Download').click()
    cy.readFile('cypress/downloads/test.docx').should('exist')
  })
}) 