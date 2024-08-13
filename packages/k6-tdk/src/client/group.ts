import { RefinedResponse } from 'k6/http'

import { endpoints } from '@/endpoints'
import { check } from '@/utils'

import { EndpointClient } from './client'

export class Group extends EndpointClient {
  getGroups(): RefinedResponse<'text'> | undefined {
    const response = endpoints.graph.v1.groups.GET_get_groups(this.httpClient, {})

    check({ val: response }, {
      'client -> group.getGroups - status': (r) => {
        return r?.status === 200
      }
    })
    return response
  }

  createGroup(p: { groupName: string }): RefinedResponse<'text'> {
    const response = endpoints.graph.v1.groups.POST__create_group(this.httpClient, p)

    check({ val: response }, {
      'client -> group.createGroup - status': ({ status }) => {
        return status === 201
      }
    })
    return response
  }

  deleteGroup(p: { groupIdOrName: string }): RefinedResponse<'text' | 'none'> {
    const response = endpoints.graph.v1.groups.DELETE__delete_group(this.httpClient, { groupId: p.groupIdOrName })

    check({ val: response }, {
      'client -> group.deleteGroup - status': ({ status }) => {
        return status === 204
      }
    })
    return response
  }

  addGroupMember(p: { groupId: string, userId: string }): RefinedResponse<'none'> | undefined {
    const response = endpoints.graph.v1.groups.POST__add_group_member(this.httpClient, { groupId: p.groupId, userId: p.userId })

    check({ val: response }, {
      'client -> group.addGroupMember - status': (r) => {
        return r?.status === 204
      }
    })
    return response
  }

  findGroup(p: { group: string }): RefinedResponse<'text'> | undefined {
    const response = endpoints.graph.v1.groups.GET_find_group(this.httpClient, p)

    check({ val: response }, {
      'client -> group.findGroup - status': (r) => {
        return r?.status === 200
      }
    })
    return response
  }
}


