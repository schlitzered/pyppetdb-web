import { teams } from '@/resources/admin'
import { users } from '@/resources/admin'
import { usersCredentials } from '@/resources/admin'
import { instances } from '@/resources/admin'
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
import { caSecrets } from '@/resources/ca'
import { caSpaces } from '@/resources/ca'
import { caSpacesCerts } from '@/resources/ca'
import { caCompromisedKeys } from '@/resources/ca'
import { jobs } from '@/resources/jobs'
import { jobDefinitions } from '@/resources/jobs'
import { jobNodeRuns } from '@/resources/jobs'
import { audit } from '@/resources/audit'
import { auditConfig } from '@/resources/audit'

export const resources = {
  teams,
  users,
  usersCredentials,
  instances,
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
  caSecrets,
  caSpaces,
  caSpacesCerts,
  caCompromisedKeys,
  jobs,
  jobDefinitions,
  jobNodeRuns,
  audit,
  auditConfig
}

export default resources
