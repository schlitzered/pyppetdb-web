import { teams } from '@/resources/admin'
import { users } from '@/resources/admin'
import { usersCredentials } from '@/resources/admin'
import { pyppetdbNodes } from '@/resources/admin'
import { nodes } from '@/resources/nodes'
import { nodesGroups } from '@/resources/nodes'
import { nodesReports } from '@/resources/nodes'
import { nodesSecretsRedactor } from '@/resources/nodes'
import { nodesDistinctFactValues } from '@/resources/nodes'
import { hieraKeys } from '@/resources/hiera'
import { hieraLevels } from '@/resources/hiera'
import { hieraLevelData } from '@/resources/hiera'
import { hieraKeyModelsStatic } from '@/resources/hiera'
import { hieraKeyModelsDynamic } from '@/resources/hiera'
import { hieraLookup } from '@/resources/hiera'
import { caAuthorities } from '@/resources/ca'
import { caAuthoritiesCerts } from '@/resources/ca'
import { caSpaces } from '@/resources/ca'
import { caSpacesCerts } from '@/resources/ca'
import { jobs } from '@/resources/jobs'
import { jobDefinitions } from '@/resources/jobs'
import { jobNodeRuns } from '@/resources/jobs'

export const resources = {
  teams,
  users,
  usersCredentials,
  pyppetdbNodes,
  nodes,
  nodesGroups,
  nodesReports,
  nodesSecretsRedactor,
  nodesDistinctFactValues,
  hieraKeys,
  hieraLevels,
  hieraLevelData,
  hieraKeyModelsStatic,
  hieraKeyModelsDynamic,
  hieraLookup,
  caAuthorities,
  caAuthoritiesCerts,
  caSpaces,
  caSpacesCerts,
  jobs,
  jobDefinitions,
  jobNodeRuns
}

export default resources
