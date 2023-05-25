describe('Hacker Stories', () => {
  const initialTerm = 'React'
  const newTerm = 'Cypress'

  context('Hitting the real API', () => {
    beforeEach(() => {
      cy.intercept({
        method: 'GET',
        pathname: '**/search',
        query: {
          query: initialTerm,
          page: '0'
        }
      }).as('getStories')
      cy.visit('/')
      cy.wait('@getStories')
    })

    it('shows 20 stories, then the next 20 after clicking "More"', () => {
      cy.intercept({
        method: 'GET',
        pathname: '**/search',
        query: {
          query: initialTerm,
          page: '1'
        }
      }).as('getNextStories')

      cy.get('.item').should('have.length', 20)

      cy.contains('More').click()
      cy.assertLoadingIsShownAndHidden()
      cy.wait('@getNextStories')

      cy.get('.item').should('have.length', 40)
    })

    it('searches via the last searched term', () => {
      cy.intercept({
        method: 'GET',
        pathname: '**/search',
        query: {
          query: newTerm,
          page: '0'
        }
      }).as('getNewTermStories')

      cy.get('#search')
        .clear()
        .type(`${newTerm}{enter}`)

      cy.wait('@getNewTermStories')

      cy.get(`button:contains(${initialTerm})`)
        .should('be.visible')
        .click()

      cy.wait('@getStories')

      cy.get('.item').should('have.length', 20)
      cy.get('.item')
        .first()
        .should('contain', initialTerm)
      cy.get(`button:contains(${newTerm})`)
        .should('be.visible')
    })
  })

  context('Mocking the API', () => {
    context('Footer and List of Stories', () => {
      beforeEach(() => {
        cy.intercept(
          'GET',
        `**/search?query=${initialTerm}&page=0`,
        { fixture: 'stories' }
        ).as('getStories')
        cy.visit('/')
        cy.assertLoadingIsShownAndHidden()
        cy.wait('@getStories')
      })

      it('shows the footer', () => {
        cy.get('footer')
          .should('be.visible')
          .and('contain', 'Icons made by Freepik from www.flaticon.com')
      })

      context('List of stories', () => {
        const stories = require('../fixtures/stories.json')
        it('shows the right data for all rendered stories', () => {
          cy.get('.item')
            .first()
            .should('contain', stories.hits[0].title)
            .and('contain', stories.hits[0].author)
            .and('contain', stories.hits[0].num_comments)
            .and('contain', stories.hits[0].points)
          cy.get('.item').contains(stories.hits[0].title)
            .should('have.attr', 'href', stories.hits[0].url)

          cy.get('.item')
            .last()
            .should('contain', stories.hits[1].title)
            .and('contain', stories.hits[1].author)
            .and('contain', stories.hits[1].num_comments)
            .and('contain', stories.hits[1].points)
          cy.get('.item').contains(stories.hits[1].title)
            .should('have.attr', 'href', stories.hits[1].url)
        })

        it('shows one less story after dimissing the first story', () => {
          cy.get('.button-small')
            .first()
            .click()

          cy.get('.item').should('have.length', 1)
        })

        context('Order by', () => {
          it('orders by title', () => {
            cy.get('.list-header-button').contains('Title').as('triggerOrderByTitle').click()

            cy.get('.item')
              .first()
              .should('be.visible')
              .contains(`${stories.hits[0].title}`)
            cy.get('.item').contains(stories.hits[0].title)
              .should('have.attr', 'href', stories.hits[0].url)

            cy.get('@triggerOrderByTitle').click()

            cy.get('.item')
              .first()
              .should('be.visible')
              .contains(`${stories.hits[1].title}`)
            cy.get('.item').contains(stories.hits[1].title)
              .should('have.attr', 'href', stories.hits[1].url)
          })

          it('orders by author', () => {
            cy.get('.list-header-button').contains('Author').as('triggerOrderByAuthor').click()

            cy.get('.item')
              .first()
              .should('be.visible')
              .contains(`${stories.hits[0].author}`)

            cy.get('@triggerOrderByAuthor').click()

            cy.get('.item')
              .first()
              .should('be.visible')
              .contains(`${stories.hits[1].author}`)
          })

          it('orders by comments', () => {
            cy.get('.list-header-button').contains('Comments').as('triggerOrderByComments').click()

            cy.get('.item')
              .first()
              .should('be.visible')
              .contains(`${stories.hits[0].num_comments}`)

            cy.get('@triggerOrderByComments').click()

            cy.get('.item')
              .first()
              .should('be.visible')
              .contains(`${stories.hits[1].num_comments}`)
          })

          it('orders by points', () => {
            cy.get('.list-header-button').contains('Points').as('triggerOrderByPoints').click()

            cy.get('.item')
              .first()
              .should('be.visible')
              .contains(`${stories.hits[0].points}`)

            cy.get('@triggerOrderByPoints').click()

            cy.get('.item')
              .first()
              .should('be.visible')
              .contains(`${stories.hits[1].points}`)
          })
        })
      })
    })

    context('Search', () => {
      beforeEach(() => {
        cy.intercept(
          'GET',
          `**/search?query=${initialTerm}&page=0`,
          { fixture: 'empty' }
        ).as('getEmptyStories')

        cy.intercept(
          'GET',
          `**/search?query=${newTerm}&page=0`,
          { fixture: 'stories' }
        ).as('getStories')

        cy.visit('/')
        cy.wait('@getEmptyStories')

        cy.get('#search')
          .clear()
      })

      it('shows no story when none is returned', () => {
        cy.get('.item').should('not.exist')
      })

      it('types and hits ENTER', () => {
        cy.get('#search')
          .type(`${newTerm}{enter}`)

        // cy.assertLoadingIsShownAndHidden()
        cy.wait('@getStories')

        cy.get('.item').should('have.length', 2)

        cy.get(`button:contains(${initialTerm})`)
          .should('be.visible')
      })

      it('types and clicks the submit button', () => {
        cy.get('#search')
          .type(newTerm)
        cy.contains('Submit')
          .click()

        // cy.assertLoadingIsShownAndHidden()
        cy.wait('@getStories')

        cy.get('.item').should('have.length', 2)
        cy.get(`button:contains(${initialTerm})`)
          .should('be.visible')
      })

      it.skip('types and submits the form directly', () => {
        cy.get('#search')
          .type(newTerm)
        cy.get('form').submit()

        cy.wait('@getNewTermStories')

        cy.get('.item').should('have.length', 20)
      })

      context('Last searches', () => {
        it('shows a max of 5 buttons for the last searched terms', () => {
          const faker = require('faker')

          cy.intercept(
            'GET',
            '**/search**',
            { fixture: 'stories' }
          ).as('getRandomStories')

          Cypress._.times(6, () => {
            cy.get('#search')
              .clear()
              .type(`${faker.random.word()}{enter}`)
            cy.wait('@getRandomStories')
          })

          cy.get('.last-searches button')
            .should('have.length', 5)
        })
      })
    })
  })
})

context('Errors', () => {
  it('shows "Something went wrong ..." in case of a server error', () => {
    cy.intercept(
      'GET',
      '**/search**',
      { statusCode: 500 }
    ).as('getServerFailure')

    cy.visit('/')
    cy.wait('@getServerFailure')
    cy.get('p:contains(Something went wrong ...)').should('be.visible')
  })

  it('shows "Something went wrong ..." in case of a network error', () => {
    cy.intercept(
      'GET',
      '**/search**',
      { statusCode: 500 }
    ).as('getNetworkFailure')

    cy.visit('/')
    cy.wait('@getNetworkFailure')
    cy.contains('Something went wrong ...').should('be.visible')
  })
})
