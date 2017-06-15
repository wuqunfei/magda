// @flow
import Publisher from './SearchFacets/Publisher';
import Format from './SearchFacets/Format';
import Region from './SearchFacets/Region';
import Temporal from './SearchFacets/Temporal';

const apiHost = 'http://104.199.180.124/';
// const apiHost = 'http://minikube.data.gov.au:30016/';
// const apiHost = 'http://localhost:3016/';

export const config = {
        appName: 'data.gov.au',
        apiHost,
        searchApiBaseUrl: apiHost + 'api/v0/search/',
        registryUrl: apiHost + 'api/v0/registry/records',
        authApiUrl: apiHost + 'api/v0/auth',
        discussionsApiUrl: apiHost + 'api/v0/discussions',
        rssUrl: 'https://nationalmap.gov.au/proxy/_0d/https://blog.data.gov.au/blogs/rss.xml',
        facetListSize: 5,
        resultsPerPage: 10,
        descriptionLength: 50,
        downloadLinksSize: 3,
        breakpoints: {
          small: 768,
          medium: 992,
          large: 1200
        },
        featuredDatasets: ['0f208fbe-8cf4-4408-b39e-07ca9700ffcf', '9804e9c3-304e-4d71-890a-3b0078df0d73'],
        exampleSearch: [
          'Business Names by ASIC as CSV',
          'Geocoded National Address File',
          'By Australian Charities and Not-for-profits Commission',
          'Taxation Statistics from 2013',
          'Trees in Victoria',
          'Budget from 2016 to 2017 by Department of Finance',
          'Planning as WMS'
        ],
        suggestion: 'Business names by ASIC as CSV',
        facets: [{id: 'publisher', component: Publisher},
                 {id: 'region', component: Region},
                 {id: 'temporal', component: Temporal},
                 {id: 'format', component: Format}
               ],
        headerNavigation: [['Search', 'search'], ['Projects', 'projects'], ['Publishers', 'publishers'], ['About', 'page/about']],
        footerNavigation: [
                    {category: 'Search', links: [['New project', 'project/new'], ['Search syntax', 'page/search-syntax']]},
                    {category: 'Projects', links: [['Browse projects', 'projects']]},
                    {category: 'Publishers', links: [['Publisher index', 'publishers'], ['Open data toolkit', 'https://toolkit.data.gov.au/index.php?title=Main_Page']]},
                    {category: 'Developers', links: [['Architecture', 'page/archetecture'], ['API doc', 'http://104.199.180.124/api/v0/registry/swagger/index.html']]},
                    {category: 'About', links: [['About data.gov.au', 'page/about'], ['Contact us', 'contact'], ['Blog', 'https://blog.data.gov.au/']]},
                    {category: 'Feedback', links: [['How can we improve data.gov.au', 'feedback']]}]
        }
