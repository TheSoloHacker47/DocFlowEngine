function logA11yViolations(violations) {
  cy.task(
    'log',
    `${violations.length} accessibility violation${
      violations.length === 1 ? '' : 's'
    } ${violations.length === 1 ? 'was' : 'were'} detected`
  )
  // pluck specific keys to keep the table readable
  const violationData = violations.map(
    ({ id, impact, description, nodes }) => ({
      id,
      impact,
      description,
      nodes: nodes.length,
    })
  )

  cy.task('table', violationData)
}

describe('Accessibility tests', () => {
  it('should have no detectable accessibility violations on the main page', () => {
    cy.visit('/')
    cy.injectAxe()
    cy.checkA11y(null, null, logA11yViolations)
  })
}) 